package com.qlda.backendjava.tasks.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class AssignLabelsDto {
    @NotEmpty(message = "Label IDs không được để trống")
    private List<String> labelIds;
}

