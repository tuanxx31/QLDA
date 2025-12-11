package com.qlda.backendjava.columns.mapper;

import com.qlda.backendjava.columns.dto.ColumnResponseDto;
import com.qlda.backendjava.columns.entity.ColumnEntity;
import com.qlda.backendjava.projects.mapper.ProjectMapper;
import com.qlda.backendjava.tasks.mapper.TaskMapper;

import java.util.List;
import java.util.stream.Collectors;

public class ColumnMapper {
    
    public static ColumnResponseDto toDto(ColumnEntity entity, boolean includeProject, boolean includeTasks) {
        if (entity == null) {
            return null;
        }
        
        ColumnResponseDto dto = new ColumnResponseDto();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setOrder(entity.getOrder());
        
        if (includeProject && entity.getProject() != null) {
            dto.setProject(ProjectMapper.toDto(entity.getProject(), false, false));
        }
        
        if (includeTasks && entity.getTasks() != null) {
            dto.setTasks(entity.getTasks().stream()
                    .map(task -> TaskMapper.toDto(task, false, true))
                    .collect(Collectors.toList()));
        }
        
        return dto;
    }
    
    public static ColumnResponseDto toDto(ColumnEntity entity) {
        return toDto(entity, false, true);
    }
    
    public static List<ColumnResponseDto> toDtoList(List<ColumnEntity> entities) {
        if (entities == null) {
            return List.of();
        }
        return entities.stream()
                .map(ColumnMapper::toDto)
                .collect(Collectors.toList());
    }
}

