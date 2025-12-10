package com.qlda.backend.groups.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateGroupDto {
    @NotBlank(message = "Tên nhóm không được để trống")
    private String name;

    private String description;
}

