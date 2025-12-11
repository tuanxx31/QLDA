package com.qlda.backendjava.labels.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LabelResponseDto {
    private String id;
    private String name;
    private String color;
    private String description;
}

