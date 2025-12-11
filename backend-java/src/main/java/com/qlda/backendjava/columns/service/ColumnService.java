package com.qlda.backendjava.columns.service;

import com.qlda.backendjava.common.exception.ForbiddenException;
import com.qlda.backendjava.common.exception.NotFoundException;
import com.qlda.backendjava.columns.dto.CreateColumnDto;
import com.qlda.backendjava.columns.dto.UpdateColumnDto;
import com.qlda.backendjava.columns.entity.ColumnEntity;
import com.qlda.backendjava.columns.repository.ColumnRepository;
import com.qlda.backendjava.permissions.service.PermissionService;
import com.qlda.backendjava.projectmember.entity.ProjectMemberEntity;
import com.qlda.backendjava.projectmember.repository.ProjectMemberRepository;
import com.qlda.backendjava.projects.entity.ProjectEntity;
import com.qlda.backendjava.projects.repository.ProjectRepository;
import com.qlda.backendjava.subtasks.entity.SubTaskEntity;
import com.qlda.backendjava.subtasks.repository.SubTaskRepository;
import com.qlda.backendjava.tasks.entity.TaskEntity;
import com.qlda.backendjava.tasks.repository.TaskRepository;
import com.qlda.backendjava.users.entity.UserEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ColumnService {

    private final ColumnRepository columnRepository;
    private final ProjectRepository projectRepository;
    private final PermissionService permissionService;
    private final TaskRepository taskRepository;
    private final SubTaskRepository subTaskRepository;
    private final ProjectMemberRepository projectMemberRepository;

    @Transactional
    public ColumnEntity create(String projectId, CreateColumnDto dto, String userId) {
        ProjectEntity project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy dự án."));

        if (!permissionService.canEditColumn(projectId, userId)) {
            throw new ForbiddenException("Không có quyền tạo cột.");
        }

        List<ColumnEntity> existingColumns = columnRepository.findByProjectId(projectId);
        int maxOrder = existingColumns.stream()
                .mapToInt(c -> c.getOrder() != null ? c.getOrder() : 0)
                .max()
                .orElse(0);

        ColumnEntity column = new ColumnEntity();
        column.setName(dto.getName());
        column.setOrder(dto.getOrder() != null ? dto.getOrder() : maxOrder + 1);
        column.setProject(project);

        return columnRepository.save(column);
    }

    @Transactional(readOnly = true)
    public List<ColumnEntity> findAll(String projectId) {
        // Fetch columns với tasks (chỉ tasks, không fetch subtasks để tránh MultipleBagFetchException)
        List<ColumnEntity> columns = columnRepository.findByProjectIdWithTasks(projectId);
        
        if (columns.isEmpty()) {
            return columns;
        }
        
        // Collect tất cả task IDs
        List<String> taskIds = columns.stream()
                .flatMap(column -> column.getTasks() != null ? column.getTasks().stream() : java.util.stream.Stream.empty())
                .map(TaskEntity::getId)
                .distinct()
                .collect(Collectors.toList());
        
        if (taskIds.isEmpty()) {
            return columns;
        }
        
        // Load subtasks cho tất cả tasks (query riêng)
        List<SubTaskEntity> allSubtasks = subTaskRepository.findByTaskIds(taskIds);
        Map<String, List<SubTaskEntity>> subtasksMap = allSubtasks.stream()
                .collect(Collectors.groupingBy(SubTaskEntity::getTaskId));
        
        // Load assignees cho tất cả tasks (query riêng)
        List<TaskEntity> tasksWithAssignees = taskRepository.findByIdsWithAssignees(taskIds);
        Map<String, TaskEntity> assigneesMap = tasksWithAssignees.stream()
                .collect(Collectors.toMap(TaskEntity::getId, task -> task));
        
        // Load labels cho tất cả tasks (query riêng)
        List<TaskEntity> tasksWithLabels = taskRepository.findByIdsWithLabels(taskIds);
        Map<String, TaskEntity> labelsMap = tasksWithLabels.stream()
                .collect(Collectors.toMap(TaskEntity::getId, task -> task));
        
        // Gán subtasks, assignees và labels vào tasks
        columns.forEach(column -> {
            if (column.getTasks() != null) {
                column.getTasks().forEach(task -> {
                    // Gán subtasks
                    List<SubTaskEntity> subtasks = subtasksMap.getOrDefault(task.getId(), List.of());
                    task.setSubtasks(new java.util.ArrayList<>(subtasks));
                    
                    // Gán assignees
                    TaskEntity taskWithAssignees = assigneesMap.get(task.getId());
                    if (taskWithAssignees != null && taskWithAssignees.getAssignees() != null) {
                        task.setAssignees(new java.util.ArrayList<>(taskWithAssignees.getAssignees()));
                    }
                    
                    // Gán labels
                    TaskEntity taskWithLabels = labelsMap.get(task.getId());
                    if (taskWithLabels != null && taskWithLabels.getLabels() != null) {
                        task.setLabels(new java.util.ArrayList<>(taskWithLabels.getLabels()));
                    }
                });
            }
        });
        
        // Filter assignees theo project members (giống NestJS)
        List<ProjectMemberEntity> projectMembers = projectMemberRepository.findByProjectIdWithUser(projectId);
        Set<String> projectMemberUserIds = projectMembers.stream()
                .map(pm -> pm.getUser().getId())
                .collect(Collectors.toSet());
        
        columns.forEach(column -> {
            if (column.getTasks() != null) {
                column.getTasks().forEach(task -> {
                    if (task.getAssignees() != null && !task.getAssignees().isEmpty()) {
                        List<UserEntity> filteredAssignees = task.getAssignees().stream()
                                .filter(assignee -> projectMemberUserIds.contains(assignee.getId()))
                                .collect(Collectors.toList());
                        task.setAssignees(filteredAssignees);
                    }
                });
            }
        });
        
        return columns;
    }

    @Transactional
    public ColumnEntity update(String id, UpdateColumnDto dto, String userId) {
        ColumnEntity column = columnRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy cột."));

        if (!permissionService.canEditColumn(column.getProject().getId(), userId)) {
            throw new ForbiddenException("Không có quyền cập nhật cột.");
        }

        if (dto.getName() != null) {
            column.setName(dto.getName());
        }
        if (dto.getOrder() != null) {
            column.setOrder(dto.getOrder());
        }

        return columnRepository.save(column);
    }

    @Transactional
    public Map<String, String> remove(String id, String userId) {
        ColumnEntity column = columnRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy cột."));

        if (!permissionService.canEditColumn(column.getProject().getId(), userId)) {
            throw new ForbiddenException("Không có quyền xóa cột.");
        }

        columnRepository.deleteById(id);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Đã xóa cột thành công.");
        return response;
    }
}

