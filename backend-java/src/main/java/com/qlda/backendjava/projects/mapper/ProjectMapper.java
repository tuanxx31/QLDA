package com.qlda.backendjava.projects.mapper;

import com.qlda.backendjava.groups.mapper.GroupMapper;
import com.qlda.backendjava.projects.dto.ProjectResponseDto;
import com.qlda.backendjava.projects.entity.ProjectEntity;
import com.qlda.backendjava.users.mapper.UserMapper;

public class ProjectMapper {
    
    public static ProjectResponseDto toDto(ProjectEntity entity, boolean includeOwner, boolean includeGroup) {
        if (entity == null) {
            return null;
        }
        
        ProjectResponseDto dto = new ProjectResponseDto();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        dto.setStartDate(entity.getStartDate());
        dto.setDeadline(entity.getDeadline());
        dto.setStatus(entity.getStatus() != null ? entity.getStatus().name() : null);
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        
        if (includeOwner && entity.getOwner() != null) {
            dto.setOwner(UserMapper.toDto(entity.getOwner()));
        }
        
        if (includeGroup && entity.getGroup() != null) {
            dto.setGroup(GroupMapper.toDto(entity.getGroup(), false));
        }
        
        return dto;
    }
    
    public static ProjectResponseDto toDto(ProjectEntity entity) {
        return toDto(entity, true, true);
    }
}

