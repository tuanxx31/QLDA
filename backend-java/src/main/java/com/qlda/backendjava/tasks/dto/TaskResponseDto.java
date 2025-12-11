package com.qlda.backendjava.tasks.dto;

import com.qlda.backendjava.columns.dto.ColumnResponseDto;
import com.qlda.backendjava.labels.dto.LabelResponseDto;
import com.qlda.backendjava.subtasks.dto.SubTaskResponseDto;
import com.qlda.backendjava.users.dto.UserResponseDto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskResponseDto {
    private String id;
    private String title;
    private String description;
    private LocalDateTime startDate;
    private LocalDateTime dueDate;
    private String status; 
    private String priority; 
    private BigDecimal position;
    private Float progress;
    private LocalDateTime completedAt;
    private String createdBy;
    private String columnId;
    
    
    private ColumnResponseDto column;
    private List<UserResponseDto> assignees;
    private List<LabelResponseDto> labels;
    private List<SubTaskResponseDto> subtasks;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

