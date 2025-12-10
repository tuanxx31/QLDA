package com.qlda.backend.statistics.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentStatisticsDto {
    private Integer totalComments;
    private Integer recentComments;
    private List<CommentByTaskDto> commentsByTask;
    private List<CommentByMemberDto> commentsByMember;
}

