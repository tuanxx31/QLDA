package com.qlda.backendjava.tasks.service;

import com.qlda.backendjava.common.exception.BadRequestException;
import com.qlda.backendjava.common.exception.ForbiddenException;
import com.qlda.backendjava.common.exception.NotFoundException;
import com.qlda.backendjava.columns.entity.ColumnEntity;
import com.qlda.backendjava.columns.repository.ColumnRepository;
import com.qlda.backendjava.projects.entity.ProjectEntity;
import com.qlda.backendjava.projects.repository.ProjectRepository;
import com.qlda.backendjava.labels.entity.LabelEntity;
import com.qlda.backendjava.labels.repository.LabelRepository;
import com.qlda.backendjava.permissions.service.PermissionService;
import com.qlda.backendjava.projectmember.repository.ProjectMemberRepository;
import com.qlda.backendjava.subtasks.entity.SubTaskEntity;
import com.qlda.backendjava.subtasks.repository.SubTaskRepository;
import com.qlda.backendjava.tasks.dto.*;
import com.qlda.backendjava.tasks.entity.TaskEntity;
import com.qlda.backendjava.tasks.repository.TaskRepository;
import com.qlda.backendjava.users.entity.UserEntity;
import com.qlda.backendjava.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final ColumnRepository columnRepository;
    private final UserRepository userRepository;
    private final LabelRepository labelRepository;
    private final SubTaskRepository subTaskRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final PermissionService permissionService;
    private final ProjectRepository projectRepository;

    
    private TaskEntity loadTaskWithAllRelations(String taskId) {
        
        TaskEntity task = taskRepository.findByIdWithRelations(taskId)
                .orElseThrow(() -> new NotFoundException("Task không tồn tại"));
        
        
        taskRepository.findByIdWithAssignees(taskId).ifPresent(taskWithAssignees -> {
            task.setAssignees(taskWithAssignees.getAssignees());
        });
        
        
        taskRepository.findByIdWithLabels(taskId).ifPresent(taskWithLabels -> {
            task.setLabels(taskWithLabels.getLabels());
        });
        
        return task;
    }

    public TaskEntity findOne(String id, String userId) {
        ensureUserCanAccessTask(id, userId);
        
        
        TaskEntity task = taskRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Task không tồn tại"));

        
        if (task.getColumn() != null && task.getColumn().getProject() != null) {
            String projectId = task.getColumn().getProject().getId();
            List<com.qlda.backendjava.projectmember.entity.ProjectMemberEntity> projectMembers =
                    projectMemberRepository.findByProjectId(projectId);
            Set<String> projectMemberUserIds = projectMembers.stream()
                    .map(pm -> pm.getUser().getId())
                    .collect(Collectors.toSet());

            if (task.getAssignees() != null) {
                task.setAssignees(task.getAssignees().stream()
                        .filter(assignee -> projectMemberUserIds.contains(assignee.getId()))
                        .collect(Collectors.toList()));
            }
        }

        return task;
    }

    public List<UserEntity> getAssignees(String id, String userId) {
        ensureUserCanAccessTask(id, userId);
        
        
        TaskEntity task = taskRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Task không tồn tại"));

        
        if (task.getColumn() == null || task.getColumn().getProject() == null) {
            return task.getAssignees() != null ? task.getAssignees() : List.of();
        }

        String projectId = task.getColumn().getProject().getId();
        List<com.qlda.backendjava.projectmember.entity.ProjectMemberEntity> projectMembers =
                projectMemberRepository.findByProjectId(projectId);
        Set<String> projectMemberUserIds = projectMembers.stream()
                .map(pm -> pm.getUser().getId())
                .collect(Collectors.toSet());

        return task.getAssignees() != null ? task.getAssignees().stream()
                .filter(assignee -> projectMemberUserIds.contains(assignee.getId()))
                .collect(Collectors.toList()) : List.of();
    }

    public List<TaskEntity> findByColumn(String columnId, String userId) {
        ensureUserCanAccessColumn(columnId, userId);
        
        ColumnEntity column = columnRepository.findById(columnId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy cột."));

        
        List<TaskEntity> tasks = taskRepository.findByColumnIdOrderByPositionAsc(columnId);
        
        if (tasks.isEmpty()) {
            return tasks;
        }
        
        
        List<String> taskIds = tasks.stream().map(TaskEntity::getId).collect(Collectors.toList());
        
        
        Map<String, TaskEntity> tasksWithAssignees = taskRepository.findByIdsWithAssignees(taskIds).stream()
                .collect(Collectors.toMap(TaskEntity::getId, task -> task));
        
        
        Map<String, TaskEntity> tasksWithLabels = taskRepository.findByIdsWithLabels(taskIds).stream()
                .collect(Collectors.toMap(TaskEntity::getId, task -> task));
        
        
        tasks.forEach(task -> {
            TaskEntity taskWithAssignees = tasksWithAssignees.get(task.getId());
            if (taskWithAssignees != null && taskWithAssignees.getAssignees() != null) {
                task.setAssignees(taskWithAssignees.getAssignees());
            } else {
                task.setAssignees(new ArrayList<>());
            }
            
            TaskEntity taskWithLabels = tasksWithLabels.get(task.getId());
            if (taskWithLabels != null && taskWithLabels.getLabels() != null) {
                task.setLabels(taskWithLabels.getLabels());
            } else {
                task.setLabels(new ArrayList<>());
            }
        });

        
        if (column.getProject() != null) {
            String projectId = column.getProject().getId();
            List<com.qlda.backendjava.projectmember.entity.ProjectMemberEntity> projectMembers =
                    projectMemberRepository.findByProjectId(projectId);
            Set<String> projectMemberUserIds = projectMembers.stream()
                    .map(pm -> pm.getUser().getId())
                    .collect(Collectors.toSet());

            tasks.forEach(task -> {
                if (task.getAssignees() != null) {
                    task.setAssignees(task.getAssignees().stream()
                            .filter(assignee -> projectMemberUserIds.contains(assignee.getId()))
                            .collect(Collectors.toList()));
                }
            });
        }

        return tasks;
    }

    @Transactional
    public TaskEntity create(CreateTaskDto dto, String creatorId) {
        ensureUserCanAccessColumn(dto.getColumnId(), creatorId);
        
        ColumnEntity column = columnRepository.findById(dto.getColumnId())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy cột."));

        if (column.getProject() == null) {
            throw new NotFoundException("Cột không thuộc project nào.");
        }

        if (!permissionService.canEditTask(column.getProject().getId(), creatorId)) {
            throw new ForbiddenException("Không có quyền tạo task.");
        }

        BigDecimal maxPosition = taskRepository.findMaxPositionByColumnId(dto.getColumnId());
        BigDecimal nextPosition = maxPosition != null ? maxPosition.add(BigDecimal.ONE) : BigDecimal.ONE;

        TaskEntity task = new TaskEntity();
        task.setTitle(dto.getTitle());
        task.setDescription(dto.getDescription());
        task.setStartDate(dto.getStartDate());
        task.setDueDate(dto.getDueDate());
        if (dto.getStatus() != null) {
            task.setStatus(TaskEntity.Status.valueOf(dto.getStatus()));
        }
        if (dto.getPriority() != null) {
            task.setPriority(TaskEntity.Priority.valueOf(dto.getPriority()));
        }
        task.setPosition(nextPosition);
        task.setColumnId(dto.getColumnId());
        task.setCreatedBy(creatorId);

        if (dto.getAssigneeIds() != null && !dto.getAssigneeIds().isEmpty()) {
            List<UserEntity> assignees = userRepository.findAllById(dto.getAssigneeIds());
            task.setAssignees(assignees);
        }

        if (dto.getLabelIds() != null && !dto.getLabelIds().isEmpty()) {
            List<LabelEntity> labels = labelRepository.findAllById(dto.getLabelIds());
            task.setLabels(labels);
        }

        TaskEntity saved = taskRepository.save(task);
        
        
        return loadTaskWithAllRelations(saved.getId());
    }

    @Transactional
    public TaskEntity update(String id, UpdateTaskDto dto, String userId) {
        ensureUserCanAccessTask(id, userId);
        
        
        TaskEntity task = taskRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Task không tồn tại"));

        if (task.getColumn() != null && task.getColumn().getProject() != null) {
            if (!permissionService.canEditTask(task.getColumn().getProject().getId(), userId)) {
                throw new ForbiddenException("Không có quyền cập nhật task.");
            }
        }

        
        if (task.getAssignees() == null) {
            task.setAssignees(new ArrayList<>());
        }
        if (task.getLabels() == null) {
            task.setLabels(new ArrayList<>());
        }

        if (dto.getTitle() != null) task.setTitle(dto.getTitle());
        if (dto.getDescription() != null) task.setDescription(dto.getDescription());
        if (dto.getStartDate() != null) task.setStartDate(dto.getStartDate());
        if (dto.getDueDate() != null) task.setDueDate(dto.getDueDate());
        if (dto.getStatus() != null) task.setStatus(TaskEntity.Status.valueOf(dto.getStatus()));
        if (dto.getPriority() != null) task.setPriority(TaskEntity.Priority.valueOf(dto.getPriority()));
        if (dto.getCompletedAt() != null) task.setCompletedAt(dto.getCompletedAt());
        if (dto.getColumnId() != null) task.setColumnId(dto.getColumnId());

        if (dto.getAssigneeIds() != null) {
            List<UserEntity> assignees = userRepository.findAllById(dto.getAssigneeIds());
            task.setAssignees(assignees);
        }

        if (dto.getLabelIds() != null) {
            List<LabelEntity> labels = labelRepository.findAllById(dto.getLabelIds());
            task.setLabels(labels);
        }

        TaskEntity saved = taskRepository.save(task);
        
        
        return loadTaskWithAllRelations(saved.getId());
    }

    @Transactional
    public Map<String, String> remove(String id, String userId) {
        ensureUserCanAccessTask(id, userId);
        
        TaskEntity task = taskRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Task không tồn tại"));

        ColumnEntity column = columnRepository.findById(task.getColumnId())
                .orElse(null);

        if (column != null && column.getProject() != null) {
            if (!permissionService.canDeleteTask(column.getProject().getId(), userId)) {
                throw new ForbiddenException("Không có quyền xóa task.");
            }
        }

        taskRepository.deleteById(id);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Đã xóa task thành công");
        return response;
    }

    @Transactional
    public TaskEntity assignUsers(String id, AssignUsersDto dto, String userId) {
        ensureUserCanAccessTask(id, userId);
        
        
        TaskEntity task = taskRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Task không tồn tại"));

        if (task.getColumn() != null && task.getColumn().getProject() != null) {
            if (!permissionService.canEditTask(task.getColumn().getProject().getId(), userId)) {
                throw new ForbiddenException("Không có quyền gán người làm task.");
            }
        }

        List<UserEntity> newUsers = userRepository.findAllById(dto.getUserIds());
        List<UserEntity> currentAssignees = task.getAssignees() != null ? task.getAssignees() : new ArrayList<>();

        List<UserEntity> merged = new ArrayList<>(currentAssignees);
        for (UserEntity newUser : newUsers) {
            boolean exists = currentAssignees.stream()
                    .anyMatch(existing -> existing.getId().equals(newUser.getId()));
            if (!exists) {
                merged.add(newUser);
            }
        }

        task.setAssignees(merged);
        TaskEntity saved = taskRepository.save(task);
        
        
        return loadTaskWithAllRelations(saved.getId());
    }

    @Transactional
    public TaskEntity unassignUsers(String id, UnassignUsersDto dto, String userId) {
        ensureUserCanAccessTask(id, userId);
        
        
        TaskEntity task = taskRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Task không tồn tại"));

        if (task.getColumn() != null && task.getColumn().getProject() != null) {
            if (!permissionService.canEditTask(task.getColumn().getProject().getId(), userId)) {
                throw new ForbiddenException("Không có quyền hủy gán người làm task.");
            }
        }

        if (task.getAssignees() != null) {
            task.setAssignees(task.getAssignees().stream()
                    .filter(assignee -> !dto.getUserIds().contains(assignee.getId()))
                    .collect(Collectors.toList()));
        }

        TaskEntity saved = taskRepository.save(task);
        
        
        return loadTaskWithAllRelations(saved.getId());
    }

    @Transactional
    public TaskEntity assignLabels(String id, AssignLabelsDto dto, String userId) {
        ensureUserCanAccessTask(id, userId);
        
        
        TaskEntity task = taskRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Task không tồn tại"));

        if (task.getColumn() != null && task.getColumn().getProject() != null) {
            if (!permissionService.canEditTask(task.getColumn().getProject().getId(), userId)) {
                throw new ForbiddenException("Không có quyền gán nhãn task.");
            }
        }

        List<LabelEntity> newLabels = labelRepository.findAllById(dto.getLabelIds());
        List<LabelEntity> currentLabels = task.getLabels() != null ? task.getLabels() : new ArrayList<>();

        List<LabelEntity> merged = new ArrayList<>(currentLabels);
        for (LabelEntity newLabel : newLabels) {
            boolean exists = currentLabels.stream()
                    .anyMatch(existing -> existing.getId().equals(newLabel.getId()));
            if (!exists) {
                merged.add(newLabel);
            }
        }

        task.setLabels(merged);
        TaskEntity saved = taskRepository.save(task);
        
        
        return loadTaskWithAllRelations(saved.getId());
    }

    @Transactional
    public TaskEntity unassignLabels(String id, AssignLabelsDto dto, String userId) {
        ensureUserCanAccessTask(id, userId);
        
        
        TaskEntity task = taskRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Task không tồn tại"));

        if (task.getColumn() != null && task.getColumn().getProject() != null) {
            if (!permissionService.canEditTask(task.getColumn().getProject().getId(), userId)) {
                throw new ForbiddenException("Không có quyền bỏ gán nhãn task.");
            }
        }

        if (task.getLabels() != null) {
            task.setLabels(task.getLabels().stream()
                    .filter(label -> !dto.getLabelIds().contains(label.getId()))
                    .collect(Collectors.toList()));
        }

        TaskEntity saved = taskRepository.save(task);
        
        
        return loadTaskWithAllRelations(saved.getId());
    }

    @Transactional
    public Map<String, Object> updatePosition(String id, String prevTaskId, String nextTaskId, String columnId, String userId) {
        ensureUserCanAccessTask(id, userId);
        
        TaskEntity task = taskRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Task không tồn tại"));

        if (columnId != null) {
            task.setColumnId(columnId);
        }

        TaskEntity prevTask = prevTaskId != null ? taskRepository.findById(prevTaskId).orElse(null) : null;
        TaskEntity nextTask = nextTaskId != null ? taskRepository.findById(nextTaskId).orElse(null) : null;

        if (prevTask != null && !prevTask.getColumnId().equals(task.getColumnId())) {
            throw new BadRequestException("prevTaskId không hợp lệ (khác column)");
        }
        if (nextTask != null && !nextTask.getColumnId().equals(task.getColumnId())) {
            throw new BadRequestException("nextTaskId không hợp lệ (khác column)");
        }

        BigDecimal newPosition;
        BigDecimal prevPos = prevTask != null ? prevTask.getPosition() : null;
        BigDecimal nextPos = nextTask != null ? nextTask.getPosition() : null;

        if (prevPos != null && nextPos != null) {
            newPosition = prevPos.add(nextPos).divide(BigDecimal.valueOf(2), 3, BigDecimal.ROUND_HALF_UP);
        } else if (prevPos != null) {
            newPosition = prevPos.add(BigDecimal.ONE);
        } else if (nextPos != null) {
            newPosition = nextPos.subtract(BigDecimal.ONE);
            if (newPosition.compareTo(BigDecimal.ONE) < 0) {
                newPosition = nextPos.divide(BigDecimal.valueOf(2), 3, BigDecimal.ROUND_HALF_UP);
            }
        } else {
            newPosition = BigDecimal.ONE;
        }

        task.setPosition(newPosition);
        taskRepository.save(task);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Cập nhật vị trí thành công");
        response.put("position", task.getPosition());
        response.put("columnId", task.getColumnId());
        return response;
    }

    @Transactional
    public TaskEntity updateStatus(String id, String status, String userId) {
        ensureUserCanAccessTask(id, userId);
        
        TaskEntity task = taskRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Task không tồn tại"));

        ColumnEntity column = columnRepository.findById(task.getColumnId())
                .orElse(null);

        if (column != null && column.getProject() != null) {
            List<String> assigneeIds = new ArrayList<>();
            if (task.getAssignees() != null) {
                assigneeIds = task.getAssignees().stream()
                        .map(UserEntity::getId)
                        .collect(Collectors.toList());
            }
            if (!permissionService.canUpdateTaskStatus(column.getProject().getId(), userId, assigneeIds)) {
                throw new ForbiddenException("Không có quyền cập nhật trạng thái task.");
            }
        }

        task.setStatus(TaskEntity.Status.valueOf(status));
        if ("done".equals(status)) {
            task.setCompletedAt(LocalDateTime.now());
        } else {
            task.setCompletedAt(null);
        }

        return taskRepository.save(task);
    }

    @Transactional
    public SubTaskEntity addSubTask(String taskId, String title, String userId) {
        ensureUserCanAccessTask(taskId, userId);
        
        TaskEntity task = taskRepository.findById(taskId)
                .orElseThrow(() -> new NotFoundException("Task không tồn tại"));

        SubTaskEntity subTask = new SubTaskEntity();
        subTask.setTaskId(taskId);
        subTask.setTitle(title);
        subTask.setCompleted(false);

        return subTaskRepository.save(subTask);
    }

    @Transactional
    public TaskEntity updateSubTask(String id, Map<String, Object> update, String userId) {
        SubTaskEntity subTask = subTaskRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("SubTask không tồn tại"));
        
        ensureUserCanAccessTask(subTask.getTaskId(), userId);

        if (update.containsKey("title")) {
            subTask.setTitle((String) update.get("title"));
        }
        if (update.containsKey("completed")) {
            boolean completed = (Boolean) update.get("completed");
            subTask.setCompleted(completed);
            if (completed) {
                subTask.setCompletedAt(LocalDateTime.now());
            } else {
                subTask.setCompletedAt(null);
            }
        }

        subTaskRepository.save(subTask);

        
        TaskEntity task = taskRepository.findById(subTask.getTaskId())
                .orElseThrow(() -> new NotFoundException("Task không tồn tại"));

        List<SubTaskEntity> allSubTasks = subTaskRepository.findByTaskId(task.getId());
        long total = allSubTasks.size();
        long done = allSubTasks.stream().filter(SubTaskEntity::getCompleted).count();
        task.setProgress(total > 0 ? (float) (done * 100.0 / total) : 0.0f);
        taskRepository.save(task);

        return task;
    }

    
    private void ensureUserCanAccessTask(String taskId, String userId) {
        TaskEntity task = taskRepository.findById(taskId)
                .orElseThrow(() -> new NotFoundException("Task không tồn tại"));
        
        if (task.getColumn() == null || task.getColumn().getProject() == null) {
            throw new NotFoundException("Task không thuộc dự án nào.");
        }
        
        String projectId = task.getColumn().getProject().getId();
        ProjectEntity project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy dự án."));
        
        
        if (project.getOwner().getId().equals(userId)) {
            return;
        }
        
        
        boolean isMember = projectMemberRepository.existsByProjectIdAndUserId(projectId, userId);
        
        if (!isMember) {
            throw new ForbiddenException("Bạn không có quyền truy cập dự án này.");
        }
    }

    
    private void ensureUserCanAccessColumn(String columnId, String userId) {
        ColumnEntity column = columnRepository.findById(columnId)
                .orElseThrow(() -> new NotFoundException("Cột không tồn tại"));
        
        if (column.getProject() == null) {
            throw new NotFoundException("Cột không thuộc dự án nào.");
        }
        
        String projectId = column.getProject().getId();
        ProjectEntity project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy dự án."));
        
        
        if (project.getOwner().getId().equals(userId)) {
            return;
        }
        
        
        boolean isMember = projectMemberRepository.existsByProjectIdAndUserId(projectId, userId);
        
        if (!isMember) {
            throw new ForbiddenException("Bạn không có quyền truy cập dự án này.");
        }
    }
}

