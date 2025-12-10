package com.qlda.backendjava.statistics.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectOverviewDto {
    private Integer totalColumns;
    private Integer totalTasks;
    private Integer doneTasks;
    private Integer todoTasks;
    private Integer overdueTasks;
}

