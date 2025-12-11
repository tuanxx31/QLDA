package com.qlda.backendjava.subtasks.mapper;

import com.qlda.backendjava.subtasks.dto.SubTaskResponseDto;
import com.qlda.backendjava.subtasks.entity.SubTaskEntity;

public class SubTaskMapper {
    
    public static SubTaskResponseDto toDto(SubTaskEntity entity) {
        if (entity == null) {
            return null;
        }
        
        SubTaskResponseDto dto = new SubTaskResponseDto();
        dto.setId(entity.getId());
        dto.setTitle(entity.getTitle());
        dto.setCompleted(entity.getCompleted());
        dto.setCompletedAt(entity.getCompletedAt());
        dto.setPosition(entity.getPosition());
        dto.setTaskId(entity.getTaskId());
        
        return dto;
    }
}

