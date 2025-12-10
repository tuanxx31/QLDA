package com.qlda.backendjava.tasks.dto;

import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class UpdateTaskDto {
    private String title;
    private String description;
    private LocalDateTime startDate;
    private LocalDateTime dueDate;

    @Pattern(regexp = "todo|done", message = "Status phải là todo hoặc done")
    private String status;

    @Pattern(regexp = "low|medium|high", message = "Priority phải là low, medium hoặc high")
    private String priority;

    private String columnId;
    private LocalDateTime completedAt;
    private List<String> assigneeIds;
    private List<String> labelIds;
}

