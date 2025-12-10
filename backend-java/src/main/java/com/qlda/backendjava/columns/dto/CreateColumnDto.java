package com.qlda.backendjava.columns.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateColumnDto {
    @NotBlank(message = "Tên cột không được để trống")
    private String name;

    private Integer order;
}

