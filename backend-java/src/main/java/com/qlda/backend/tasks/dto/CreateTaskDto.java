package com.qlda.backend.tasks.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class CreateTaskDto {
    @NotBlank(message = "Title không được để trống")
    private String title;

    private String description;
    private LocalDateTime startDate;
    private LocalDateTime dueDate;

    @Pattern(regexp = "todo|done", message = "Status phải là todo hoặc done")
    private String status = "todo";

    @Pattern(regexp = "low|medium|high", message = "Priority phải là low, medium hoặc high")
    private String priority = "medium";

    @NotBlank(message = "Column ID không được để trống")
    private String columnId;

    private List<String> assigneeIds;
    private List<String> labelIds;
}

