package com.qlda.backendjava.projects.service;

import com.qlda.backendjava.columns.entity.ColumnEntity;
import com.qlda.backendjava.columns.repository.ColumnRepository;
import com.qlda.backendjava.common.exception.ForbiddenException;
import com.qlda.backendjava.common.exception.NotFoundException;
import com.qlda.backendjava.groupmember.entity.GroupMemberEntity;
import com.qlda.backendjava.groupmember.repository.GroupMemberRepository;
import com.qlda.backendjava.groups.entity.GroupEntity;
import com.qlda.backendjava.groups.repository.GroupRepository;
import com.qlda.backendjava.projectmember.entity.ProjectMemberEntity;
import com.qlda.backendjava.projectmember.repository.ProjectMemberRepository;
import com.qlda.backendjava.projects.dto.CreateProjectDto;
import com.qlda.backendjava.projects.dto.UpdateProjectDto;
import com.qlda.backendjava.projects.entity.ProjectEntity;
import com.qlda.backendjava.projects.repository.ProjectRepository;
import com.qlda.backendjava.tasks.entity.TaskEntity;
import com.qlda.backendjava.tasks.repository.TaskRepository;
import com.qlda.backendjava.users.entity.UserEntity;
import com.qlda.backendjava.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final TaskRepository taskRepository;
    private final ColumnRepository columnRepository;

    @Transactional
    public ProjectEntity create(CreateProjectDto dto, String userId) {
        UserEntity owner = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy người dùng."));

        GroupEntity group = null;
        if (dto.getGroupId() != null && !dto.getGroupId().isEmpty()) {
            group = groupRepository.findById(dto.getGroupId())
                    .orElseThrow(() -> new NotFoundException("Không tìm thấy nhóm."));
        }

        ProjectEntity project = new ProjectEntity();
        project.setName(dto.getName());
        project.setDescription(dto.getDescription());
        project.setStartDate(dto.getStartDate());
        project.setDeadline(dto.getDeadline());
        if (dto.getStatus() != null) {
            project.setStatus(ProjectEntity.Status.valueOf(dto.getStatus()));
        }
        project.setOwner(owner);
        project.setGroup(group);

        ProjectEntity savedProject = projectRepository.save(project);

        ProjectMemberEntity leaderMember = new ProjectMemberEntity();
        leaderMember.setProject(savedProject);
        leaderMember.setUser(owner);
        leaderMember.setRole(ProjectMemberEntity.Role.leader);
        projectMemberRepository.save(leaderMember);

        return savedProject;
    }

    public List<ProjectEntity> findAllByUser(String userId) {
        List<ProjectMemberEntity> memberships = projectMemberRepository.findByUserId(userId);
        return memberships.stream()
                .map(ProjectMemberEntity::getProject)
                .distinct()
                .toList();
    }

    public List<ProjectEntity> findAllByGroup(String groupId, String userId) {
        // 1. Kiểm tra group tồn tại
        GroupEntity group = groupRepository.findById(groupId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy nhóm."));

        // 2. Kiểm tra user có phải member của group không
        GroupMemberEntity groupMember = groupMemberRepository
                .findByGroupIdAndUserId(groupId, userId)
                .orElse(null);
        
        if (groupMember == null || groupMember.getStatus() != GroupMemberEntity.Status.accepted) {
            throw new ForbiddenException("Bạn không phải thành viên của nhóm này.");
        }

        // 3. Kiểm tra có phải leader không
        boolean isLeader = groupMember.getRole() == GroupMemberEntity.Role.leader;

        // 4. Query projects
        if (isLeader) {
            // Leader xem tất cả projects của group
            return projectRepository.findByGroupId(groupId);
        } else {
            // Member chỉ xem projects mà họ là member
            return projectRepository.findByGroupIdAndUserId(groupId, userId);
        }
    }

    public ProjectEntity findOne(String id, String userId) {
        ensureUserIsProjectMember(id, userId);
        return projectRepository.findByIdWithMembers(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy dự án."));
    }

    @Transactional
    public ProjectEntity update(String id, UpdateProjectDto dto, String userId) {
        ProjectEntity project = projectRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy dự án."));

        boolean isOwner = project.getOwner().getId().equals(userId);
        ProjectMemberEntity member = projectMemberRepository.findByProjectIdAndUserId(id, userId).orElse(null);
        boolean isLeader = member != null && member.getRole() == ProjectMemberEntity.Role.leader;

        if (!isOwner && !isLeader) {
            throw new ForbiddenException("Không có quyền chỉnh sửa dự án.");
        }

        if (dto.getName() != null) project.setName(dto.getName());
        if (dto.getDescription() != null) project.setDescription(dto.getDescription());
        if (dto.getStartDate() != null) project.setStartDate(dto.getStartDate());
        if (dto.getDeadline() != null) project.setDeadline(dto.getDeadline());
        if (dto.getStatus() != null) project.setStatus(ProjectEntity.Status.valueOf(dto.getStatus()));
        
        if (dto.getGroupId() != null) {
            if ("0".equals(dto.getGroupId())) {
                project.setGroup(null);
            } else {
                GroupEntity group = groupRepository.findById(dto.getGroupId())
                        .orElseThrow(() -> new NotFoundException("Không tìm thấy nhóm."));
                project.setGroup(group);
            }
        }

        return projectRepository.save(project);
    }

    @Transactional
    public Map<String, String> remove(String id, String userId) {
        ProjectEntity project = projectRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy dự án."));

        if (!project.getOwner().getId().equals(userId)) {
            throw new ForbiddenException("Chỉ chủ sở hữu mới có thể xóa dự án.");
        }

        projectRepository.deleteById(id);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Đã xóa dự án thành công.");
        return response;
    }

    @Transactional
    public Map<String, String> convertToGroup(String projectId, String groupId, String userId) {
        ProjectEntity project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy dự án."));

        if (!project.getOwner().getId().equals(userId)) {
            throw new ForbiddenException("Chỉ chủ sở hữu mới được chuyển dự án.");
        }

        GroupEntity group = groupRepository.findById(groupId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy nhóm."));

        project.setGroup(group);
        projectRepository.save(project);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Đã chuyển dự án cá nhân thành dự án nhóm.");
        return response;
    }

    @Transactional
    public Map<String, String> removeGroup(String projectId, String userId) {
        ProjectEntity project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy dự án."));

        if (!project.getOwner().getId().equals(userId)) {
            throw new ForbiddenException("Chỉ chủ sở hữu mới được tách nhóm.");
        }

        project.setGroup(null);
        projectRepository.save(project);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Đã tách dự án khỏi nhóm.");
        return response;
    }

    public Map<String, Object> getProjectProgress(String id, String userId) {
        ensureUserIsProjectMember(id, userId);
        
        // Get all columns for this project
        List<ColumnEntity> columns = columnRepository.findByProjectId(id);
        List<String> columnIds = columns.stream()
                .map(ColumnEntity::getId)
                .collect(Collectors.toList());
        
        // Get all tasks for these columns
        List<TaskEntity> tasks = new ArrayList<>();
        for (String columnId : columnIds) {
            tasks.addAll(taskRepository.findByColumnIdOrderByPositionAsc(columnId));
        }
        
        int total = tasks.size();
        long done = tasks.stream()
                .filter(t -> t.getStatus() == TaskEntity.Status.done)
                .count();
        int todo = total - (int) done;
        
        double progress = total == 0 ? 0 : (done * 100.0 / total);
        
        Map<String, Object> result = new HashMap<>();
        result.put("progress", Math.round(progress * 100.0) / 100.0);
        result.put("totalTasks", total);
        result.put("doneTasks", (int) done);
        result.put("todoTasks", todo);
        return result;
    }

    public List<Map<String, Object>> getColumnProgress(String id, String userId) {
        ensureUserIsProjectMember(id, userId);
        
        List<ColumnEntity> columns = columnRepository.findByProjectId(id);
        
        return columns.stream()
                .map(column -> {
                    List<TaskEntity> tasks = taskRepository.findByColumnIdOrderByPositionAsc(column.getId());
                    int total = tasks.size();
                    long done = tasks.stream()
                            .filter(t -> t.getStatus() == TaskEntity.Status.done)
                            .count();
                    int todo = total - (int) done;
                    double progress = total == 0 ? 0 : (done * 100.0 / total);
                    
                    Map<String, Object> result = new HashMap<>();
                    result.put("columnId", column.getId());
                    result.put("columnName", column.getName());
                    result.put("totalTasks", total);
                    result.put("doneTasks", (int) done);
                    result.put("todoTasks", todo);
                    result.put("progress", Math.round(progress * 100.0) / 100.0);
                    return result;
                })
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getUserProgress(String id, String userId) {
        ensureUserIsProjectMember(id, userId);
        
        // Get all columns for this project
        List<ColumnEntity> columns = columnRepository.findByProjectId(id);
        List<String> columnIds = columns.stream()
                .map(ColumnEntity::getId)
                .collect(Collectors.toList());
        
        // Get all tasks with assignees (already loaded via EntityGraph in findByColumnIdOrderByPositionAsc)
        List<TaskEntity> tasks = new ArrayList<>();
        for (String columnId : columnIds) {
            List<TaskEntity> columnTasks = taskRepository.findByColumnIdOrderByPositionAsc(columnId);
            tasks.addAll(columnTasks);
        }
        
        // Group by user
        Map<String, Map<String, Object>> userStatsMap = new HashMap<>();
        
        for (TaskEntity task : tasks) {
            if (task.getAssignees() != null && !task.getAssignees().isEmpty()) {
                for (UserEntity assignee : task.getAssignees()) {
                    userStatsMap.computeIfAbsent(assignee.getId(), k -> {
                        Map<String, Object> stats = new HashMap<>();
                        stats.put("userId", assignee.getId());
                        stats.put("avatar", assignee.getAvatar() != null ? assignee.getAvatar() : "https://cdn-icons-png.flaticon.com/512/149/149071.png");
                        stats.put("name", assignee.getName() != null ? assignee.getName() : assignee.getEmail());
                        stats.put("totalTasks", 0);
                        stats.put("doneTasks", 0);
                        stats.put("todoTasks", 0);
                        return stats;
                    });
                    
                    Map<String, Object> stats = userStatsMap.get(assignee.getId());
                    stats.put("totalTasks", ((Integer) stats.get("totalTasks")) + 1);
                    if (task.getStatus() == TaskEntity.Status.done) {
                        stats.put("doneTasks", ((Integer) stats.get("doneTasks")) + 1);
                    } else {
                        stats.put("todoTasks", ((Integer) stats.get("todoTasks")) + 1);
                    }
                }
            }
        }
        
        // Calculate progress and sort
        return userStatsMap.values().stream()
                .map(stats -> {
                    int total = (Integer) stats.get("totalTasks");
                    int done = (Integer) stats.get("doneTasks");
                    double progress = total == 0 ? 0 : (done * 100.0 / total);
                    stats.put("progress", Math.round(progress * 100.0) / 100.0);
                    return stats;
                })
                .sorted((a, b) -> Integer.compare((Integer) b.get("totalTasks"), (Integer) a.get("totalTasks")))
                .collect(Collectors.toList());
    }

    public Map<String, Object> getDeadlineSummary(String id, String userId) {
        ensureUserIsProjectMember(id, userId);
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime threeDaysLater = now.plusDays(3);
        
        // Get all columns for this project
        List<ColumnEntity> columns = columnRepository.findByProjectId(id);
        List<String> columnIds = columns.stream()
                .map(ColumnEntity::getId)
                .collect(Collectors.toList());
        
        // Get all tasks with due dates
        List<TaskEntity> tasks = new ArrayList<>();
        for (String columnId : columnIds) {
            List<TaskEntity> columnTasks = taskRepository.findByColumnIdOrderByPositionAsc(columnId);
            tasks.addAll(columnTasks.stream()
                    .filter(t -> t.getDueDate() != null)
                    .collect(Collectors.toList()));
        }
        
        int overdue = 0;
        int dueSoon = 0;
        int completedOnTime = 0;
        int completedLate = 0;
        
        for (TaskEntity task : tasks) {
            if (task.getDueDate() == null) continue;
            
            LocalDateTime dueDate = task.getDueDate();
            boolean isOverdue = dueDate.isBefore(now) && task.getStatus() != TaskEntity.Status.done;
            boolean isDueSoon = !dueDate.isBefore(now) && 
                                !dueDate.isAfter(threeDaysLater) && 
                                task.getStatus() != TaskEntity.Status.done;
            
            if (isOverdue) {
                overdue++;
            } else if (isDueSoon) {
                dueSoon++;
            }
            
            if (task.getStatus() == TaskEntity.Status.done && task.getCompletedAt() != null) {
                LocalDateTime completedAt = task.getCompletedAt();
                if (!completedAt.isAfter(dueDate)) {
                    completedOnTime++;
                } else {
                    completedLate++;
                }
            }
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("overdue", overdue);
        result.put("dueSoon", dueSoon);
        result.put("completedOnTime", completedOnTime);
        result.put("completedLate", completedLate);
        return result;
    }

    /**
     * Kiểm tra user có phải member của project không (owner hoặc project member)
     * Throw ForbiddenException nếu không phải member
     */
    private void ensureUserIsProjectMember(String projectId, String userId) {
        ProjectEntity project = projectRepository.findByIdWithMembers(projectId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy dự án."));
        
        // Kiểm tra owner
        if (project.getOwner().getId().equals(userId)) {
            return;
        }
        
        // Kiểm tra member
        boolean isMember = project.getMembers().stream()
                .anyMatch(m -> m.getUser().getId().equals(userId));
        
        if (!isMember) {
            throw new ForbiddenException("Bạn không có quyền truy cập dự án này.");
        }
    }
}

