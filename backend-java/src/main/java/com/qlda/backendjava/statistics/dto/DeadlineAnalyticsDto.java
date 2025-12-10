package com.qlda.backendjava.statistics.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeadlineAnalyticsDto {
    private Integer overdueTasks;
    private Integer dueSoonTasks;
    private Integer completedOnTime;
    private Integer completedLate;
    private List<TaskDeadlineDto> overdueTasksList;
    private List<TaskDeadlineDto> dueSoonTasksList;
    private List<TaskDeadlineDto> completedOnTimeList;
    private List<TaskDeadlineDto> completedLateList;
}

