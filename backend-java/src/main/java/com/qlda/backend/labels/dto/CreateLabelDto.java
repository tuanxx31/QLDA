package com.qlda.backend.labels.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateLabelDto {
    private String name;

    @NotBlank(message = "Color không được để trống")
    private String color;

    @NotBlank(message = "Project ID không được để trống")
    private String projectId;
}

