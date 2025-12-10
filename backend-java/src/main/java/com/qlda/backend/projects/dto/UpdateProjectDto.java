package com.qlda.backend.projects.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdateProjectDto {
    private String name;
    private String description;
    private LocalDate startDate;
    private LocalDate deadline;
    private String status;
    private String groupId;
}

