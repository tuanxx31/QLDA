package com.qlda.backendjava.labels.mapper;

import com.qlda.backendjava.labels.dto.LabelResponseDto;
import com.qlda.backendjava.labels.entity.LabelEntity;

public class LabelMapper {
    
    public static LabelResponseDto toDto(LabelEntity entity) {
        if (entity == null) {
            return null;
        }
        
        LabelResponseDto dto = new LabelResponseDto();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setColor(entity.getColor());
        dto.setDescription(entity.getDescription());
        
        return dto;
    }
}

