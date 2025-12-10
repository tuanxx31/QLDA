package com.qlda.backend.statistics.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentByTaskDto {
    private String taskId;
    private String taskTitle;
    private Integer commentCount;
}

