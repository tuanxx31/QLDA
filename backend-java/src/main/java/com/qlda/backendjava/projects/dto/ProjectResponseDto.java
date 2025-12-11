package com.qlda.backendjava.projects.dto;

import com.qlda.backendjava.groups.dto.GroupResponseDto;
import com.qlda.backendjava.users.dto.UserResponseDto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectResponseDto {
    private String id;
    private String name;
    private String description;
    private LocalDate startDate;
    private LocalDate deadline;
    private String status;
    
    
    private UserResponseDto owner;
    private GroupResponseDto group; 
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

