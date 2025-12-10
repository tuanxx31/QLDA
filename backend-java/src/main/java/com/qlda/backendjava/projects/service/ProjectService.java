package com.qlda.backendjava.projects.service;

import com.qlda.backendjava.common.exception.ForbiddenException;
import com.qlda.backendjava.common.exception.NotFoundException;
import com.qlda.backendjava.groups.entity.GroupEntity;
import com.qlda.backendjava.groups.repository.GroupRepository;
import com.qlda.backendjava.projectmember.entity.ProjectMemberEntity;
import com.qlda.backendjava.projectmember.repository.ProjectMemberRepository;
import com.qlda.backendjava.projects.dto.CreateProjectDto;
import com.qlda.backendjava.projects.dto.UpdateProjectDto;
import com.qlda.backendjava.projects.entity.ProjectEntity;
import com.qlda.backendjava.projects.repository.ProjectRepository;
import com.qlda.backendjava.users.entity.UserEntity;
import com.qlda.backendjava.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final GroupRepository groupRepository;
    private final ProjectMemberRepository projectMemberRepository;

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
        GroupEntity group = groupRepository.findById(groupId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy nhóm."));

        return projectRepository.findByGroupId(groupId);
    }

    public ProjectEntity findOne(String id) {
        return projectRepository.findById(id)
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

    // Progress methods sẽ được implement đầy đủ trong StatisticsService
    public Map<String, Object> getProjectProgress(String id) {
        projectRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy dự án."));
        
        // Delegate to statistics service hoặc implement here
        Map<String, Object> result = new HashMap<>();
        result.put("progress", 0.0);
        result.put("totalTasks", 0);
        result.put("doneTasks", 0);
        result.put("todoTasks", 0);
        return result;
    }

    public List<Map<String, Object>> getColumnProgress(String id) {
        projectRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy dự án."));
        
        // Delegate to statistics service
        return List.of();
    }

    public List<Map<String, Object>> getUserProgress(String id) {
        projectRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy dự án."));
        
        // Delegate to statistics service
        return List.of();
    }

    public Map<String, Object> getDeadlineSummary(String id) {
        projectRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy dự án."));
        
        // Delegate to statistics service
        Map<String, Object> result = new HashMap<>();
        result.put("overdue", 0);
        result.put("dueSoon", 0);
        result.put("completedOnTime", 0);
        result.put("completedLate", 0);
        return result;
    }
}

