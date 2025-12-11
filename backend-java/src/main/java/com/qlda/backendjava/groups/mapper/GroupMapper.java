package com.qlda.backendjava.groups.mapper;

import com.qlda.backendjava.groups.dto.GroupResponseDto;
import com.qlda.backendjava.groups.entity.GroupEntity;
import com.qlda.backendjava.users.mapper.UserMapper;

public class GroupMapper {
    
    public static GroupResponseDto toDto(GroupEntity entity, boolean includeLeader) {
        if (entity == null) {
            return null;
        }
        
        GroupResponseDto dto = new GroupResponseDto();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        dto.setInviteCode(entity.getInviteCode());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        
        if (includeLeader && entity.getLeader() != null) {
            dto.setLeader(UserMapper.toDto(entity.getLeader()));
        }
        
        return dto;
    }
    
    public static GroupResponseDto toDto(GroupEntity entity) {
        return toDto(entity, true);
    }
}

