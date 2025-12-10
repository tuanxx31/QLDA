package com.qlda.backend.statistics.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskDeadlineDto {
    private String taskId;
    private String taskTitle;
    private LocalDateTime dueDate;
    private String status;
    private LocalDateTime completedAt;
}

