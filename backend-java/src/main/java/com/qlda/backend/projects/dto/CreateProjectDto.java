package com.qlda.backend.projects.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateProjectDto {
    @NotBlank(message = "Tên dự án không được để trống")
    private String name;

    private String description;
    private LocalDate startDate;
    private LocalDate deadline;

    @Pattern(regexp = "todo|doing|done", message = "Status phải là todo, doing hoặc done")
    private String status = "todo";

    private String groupId;
}

