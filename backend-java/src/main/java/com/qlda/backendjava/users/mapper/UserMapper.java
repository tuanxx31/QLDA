package com.qlda.backendjava.users.mapper;

import com.qlda.backendjava.users.dto.UserResponseDto;
import com.qlda.backendjava.users.entity.UserEntity;

public class UserMapper {
    
    public static UserResponseDto toDto(UserEntity entity) {
        if (entity == null) {
            return null;
        }
        
        UserResponseDto dto = new UserResponseDto();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setEmail(entity.getEmail());
        dto.setAvatar(entity.getAvatar());
        dto.setStudentCode(entity.getStudentCode());
        dto.setDepartment(entity.getDepartment());
        dto.setDateOfBirth(entity.getDateOfBirth());
        dto.setGender(entity.getGender() != null ? entity.getGender().name() : null);
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        
        return dto;
    }
}

