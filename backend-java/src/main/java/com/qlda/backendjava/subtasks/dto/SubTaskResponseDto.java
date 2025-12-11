package com.qlda.backendjava.subtasks.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubTaskResponseDto {
    private String id;
    private String title;
    private Boolean completed;
    private LocalDateTime completedAt;
    private BigDecimal position;
    private String taskId;
}

