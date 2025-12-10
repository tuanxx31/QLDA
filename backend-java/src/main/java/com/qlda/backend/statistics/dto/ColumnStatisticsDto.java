package com.qlda.backend.statistics.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ColumnStatisticsDto {
    private String columnId;
    private String columnName;
    private Integer totalTasks;
    private Integer doneTasks;
    private Integer todoTasks;
    private Double progress;
}

