package com.qlda.backend.statistics.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TimelineStatisticsDto {
    private String date;
    private Integer createdTasks;
    private Integer completedTasks;
    private Integer onTimeTasks;
    private Integer lateTasks;
}

