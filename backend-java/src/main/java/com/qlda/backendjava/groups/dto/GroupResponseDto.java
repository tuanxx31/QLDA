package com.qlda.backendjava.groups.dto;

import com.qlda.backendjava.users.dto.UserResponseDto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GroupResponseDto {
    private String id;
    private String name;
    private String description;
    private String inviteCode;
    
    
    private UserResponseDto leader;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

