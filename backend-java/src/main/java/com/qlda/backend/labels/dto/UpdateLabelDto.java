package com.qlda.backend.labels.dto;

import lombok.Data;

@Data
public class UpdateLabelDto {
    private String name;
    private String color;
    private String description;
}

