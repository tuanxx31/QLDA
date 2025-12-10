package com.qlda.backend.statistics.controller;

import com.qlda.backend.common.ApiResponse;
import com.qlda.backend.statistics.dto.*;
import com.qlda.backend.statistics.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/projects/{projectId}/statistics")
@RequiredArgsConstructor
public class StatisticsController {

    private final StatisticsService statisticsService;

    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<ProjectOverviewDto>> getProjectOverview(@PathVariable String projectId) {
        ProjectOverviewDto overview = statisticsService.getProjectOverview(projectId);
        return ResponseEntity.ok(ApiResponse.success(overview));
    }

    @GetMapping("/columns")
    public ResponseEntity<ApiResponse<List<ColumnStatisticsDto>>> getColumnStatistics(@PathVariable String projectId) {
        List<ColumnStatisticsDto> statistics = statisticsService.getColumnStatistics(projectId);
        return ResponseEntity.ok(ApiResponse.success(statistics));
    }

    @GetMapping("/members")
    public ResponseEntity<ApiResponse<List<MemberStatisticsDto>>> getMemberStatistics(@PathVariable String projectId) {
        List<MemberStatisticsDto> statistics = statisticsService.getMemberStatistics(projectId);
        return ResponseEntity.ok(ApiResponse.success(statistics));
    }

    @GetMapping("/timeline")
    public ResponseEntity<ApiResponse<List<TimelineStatisticsDto>>> getTimelineStatistics(
            @PathVariable String projectId,
            @RequestParam(required = false, defaultValue = "day") String period,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        List<TimelineStatisticsDto> statistics = statisticsService.getTimelineStatistics(
                projectId, period, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(statistics));
    }

    @GetMapping("/comments")
    public ResponseEntity<ApiResponse<CommentStatisticsDto>> getCommentStatistics(
            @PathVariable String projectId,
            @RequestParam(required = false, defaultValue = "all") String filter) {
        CommentStatisticsDto statistics = statisticsService.getCommentStatistics(projectId, filter);
        return ResponseEntity.ok(ApiResponse.success(statistics));
    }

    @GetMapping("/deadlines")
    public ResponseEntity<ApiResponse<DeadlineAnalyticsDto>> getDeadlineAnalytics(@PathVariable String projectId) {
        DeadlineAnalyticsDto analytics = statisticsService.getDeadlineAnalytics(projectId);
        return ResponseEntity.ok(ApiResponse.success(analytics));
    }
}

