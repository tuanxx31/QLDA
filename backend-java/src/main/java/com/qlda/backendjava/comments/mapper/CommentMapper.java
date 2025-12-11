package com.qlda.backendjava.comments.mapper;

import com.qlda.backendjava.comments.dto.CommentResponseDto;
import com.qlda.backendjava.comments.entity.CommentEntity;
import com.qlda.backendjava.tasks.mapper.TaskMapper;
import com.qlda.backendjava.users.mapper.UserMapper;

import java.util.List;
import java.util.stream.Collectors;

public class CommentMapper {
    
    public static CommentResponseDto toDto(CommentEntity entity, boolean includeTask, boolean includeMentions) {
        if (entity == null) {
            return null;
        }
        
        CommentResponseDto dto = new CommentResponseDto();
        dto.setId(entity.getId());
        dto.setContent(entity.getContent());
        dto.setUserId(entity.getUserId());
        dto.setTaskId(entity.getTaskId());
        dto.setFileUrl(entity.getFileUrl());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        
        if (entity.getUser() != null) {
            dto.setUser(UserMapper.toDto(entity.getUser()));
        }
        
        if (includeMentions && entity.getMentions() != null) {
            dto.setMentions(entity.getMentions().stream()
                    .map(UserMapper::toDto)
                    .collect(Collectors.toList()));
        }
        
        if (includeTask && entity.getTask() != null) {
            dto.setTask(TaskMapper.toDto(entity.getTask(), false, false));
        }
        
        return dto;
    }
    
    public static CommentResponseDto toDto(CommentEntity entity) {
        return toDto(entity, false, true);
    }
    
    public static List<CommentResponseDto> toDtoList(List<CommentEntity> entities) {
        if (entities == null) {
            return List.of();
        }
        return entities.stream()
                .map(CommentMapper::toDto)
                .collect(Collectors.toList());
    }
}

