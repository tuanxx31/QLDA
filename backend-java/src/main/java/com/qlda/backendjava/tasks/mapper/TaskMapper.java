package com.qlda.backendjava.tasks.mapper;

import com.qlda.backendjava.columns.mapper.ColumnMapper;
import com.qlda.backendjava.labels.mapper.LabelMapper;
import com.qlda.backendjava.subtasks.mapper.SubTaskMapper;
import com.qlda.backendjava.tasks.dto.TaskResponseDto;
import com.qlda.backendjava.tasks.entity.TaskEntity;
import com.qlda.backendjava.users.mapper.UserMapper;

import java.util.List;
import java.util.stream.Collectors;

public class TaskMapper {
    
    public static TaskResponseDto toDto(TaskEntity entity, boolean includeColumn, boolean includeNested) {
        if (entity == null) {
            return null;
        }
        
        TaskResponseDto dto = new TaskResponseDto();
        dto.setId(entity.getId());
        dto.setTitle(entity.getTitle());
        dto.setDescription(entity.getDescription());
        dto.setStartDate(entity.getStartDate());
        dto.setDueDate(entity.getDueDate());
        dto.setStatus(entity.getStatus() != null ? entity.getStatus().name() : null);
        dto.setPriority(entity.getPriority() != null ? entity.getPriority().name() : null);
        dto.setPosition(entity.getPosition());
        dto.setProgress(entity.getProgress());
        dto.setCompletedAt(entity.getCompletedAt());
        dto.setCreatedBy(entity.getCreatedBy());
        dto.setColumnId(entity.getColumnId());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        
        if (includeNested) {
            if (includeColumn && entity.getColumn() != null) {
                dto.setColumn(ColumnMapper.toDto(entity.getColumn(), false, false));
            }
            
            if (entity.getAssignees() != null) {
                dto.setAssignees(entity.getAssignees().stream()
                        .map(UserMapper::toDto)
                        .collect(Collectors.toList()));
            }
            
            if (entity.getLabels() != null) {
                dto.setLabels(entity.getLabels().stream()
                        .map(LabelMapper::toDto)
                        .collect(Collectors.toList()));
            }
            
            if (entity.getSubtasks() != null) {
                dto.setSubtasks(entity.getSubtasks().stream()
                        .map(SubTaskMapper::toDto)
                        .collect(Collectors.toList()));
            }
        }
        
        return dto;
    }
    
    public static TaskResponseDto toDto(TaskEntity entity) {
        return toDto(entity, true, true);
    }
    
    public static List<TaskResponseDto> toDtoList(List<TaskEntity> entities) {
        if (entities == null) {
            return List.of();
        }
        return entities.stream()
                .map(TaskMapper::toDto)
                .collect(Collectors.toList());
    }
}

