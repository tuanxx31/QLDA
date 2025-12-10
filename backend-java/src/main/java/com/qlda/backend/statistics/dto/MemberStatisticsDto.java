package com.qlda.backend.statistics.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MemberStatisticsDto {
    private String userId;
    private String name;
    private String avatar;
    private Integer totalTasks;
    private Integer doneTasks;
    private Integer todoTasks;
    private Integer overdueTasks;
    private Double completionRate;
}

