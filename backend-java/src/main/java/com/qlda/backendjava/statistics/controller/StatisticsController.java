package com.qlda.backendjava.statistics.controller;

import com.qlda.backendjava.statistics.dto.*;
import com.qlda.backendjava.statistics.service.StatisticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@Tag(name = "Statistics", description = "API thống kê và phân tích dự án")
@RestController
@RequestMapping("/api/projects/{projectId}/statistics")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
public class StatisticsController {

    private final StatisticsService statisticsService;

    @GetMapping("/overview")
    public ResponseEntity<ProjectOverviewDto> getProjectOverview(@PathVariable String projectId) {
        ProjectOverviewDto overview = statisticsService.getProjectOverview(projectId);
        return ResponseEntity.ok(overview);
    }

    @GetMapping("/columns")
    public ResponseEntity<List<ColumnStatisticsDto>> getColumnStatistics(@PathVariable String projectId) {
        List<ColumnStatisticsDto> statistics = statisticsService.getColumnStatistics(projectId);
        return ResponseEntity.ok(statistics);
    }

    @GetMapping("/members")
    public ResponseEntity<List<MemberStatisticsDto>> getMemberStatistics(@PathVariable String projectId) {
        List<MemberStatisticsDto> statistics = statisticsService.getMemberStatistics(projectId);
        return ResponseEntity.ok(statistics);
    }

    @GetMapping("/timeline")
    public ResponseEntity<List<TimelineStatisticsDto>> getTimelineStatistics(
            @PathVariable String projectId,
            @RequestParam(required = false, defaultValue = "day") String period,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        List<TimelineStatisticsDto> statistics = statisticsService.getTimelineStatistics(
                projectId, period, startDate, endDate);
        return ResponseEntity.ok(statistics);
    }

    @GetMapping("/comments")
    public ResponseEntity<CommentStatisticsDto> getCommentStatistics(
            @PathVariable String projectId,
            @RequestParam(required = false, defaultValue = "all") String filter) {
        CommentStatisticsDto statistics = statisticsService.getCommentStatistics(projectId, filter);
        return ResponseEntity.ok(statistics);
    }

    @GetMapping("/deadlines")
    public ResponseEntity<DeadlineAnalyticsDto> getDeadlineAnalytics(@PathVariable String projectId) {
        DeadlineAnalyticsDto analytics = statisticsService.getDeadlineAnalytics(projectId);
        return ResponseEntity.ok(analytics);
    }
}

