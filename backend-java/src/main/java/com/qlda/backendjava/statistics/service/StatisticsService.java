package com.qlda.backendjava.statistics.service;

import com.qlda.backendjava.common.exception.NotFoundException;
import com.qlda.backendjava.columns.repository.ColumnRepository;
import com.qlda.backendjava.comments.entity.CommentEntity;
import com.qlda.backendjava.comments.repository.CommentRepository;
import com.qlda.backendjava.projects.entity.ProjectEntity;
import com.qlda.backendjava.projects.repository.ProjectRepository;
import com.qlda.backendjava.statistics.dto.*;
import com.qlda.backendjava.tasks.entity.TaskEntity;
import com.qlda.backendjava.tasks.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatisticsService {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final ColumnRepository columnRepository;
    private final CommentRepository commentRepository;

    public ProjectOverviewDto getProjectOverview(String projectId) {
        ProjectEntity project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy dự án."));

        long totalColumns = columnRepository.findByProjectId(projectId).size();

        // Get all columns for this project
        List<com.qlda.backendjava.columns.entity.ColumnEntity> columns = columnRepository.findByProjectId(projectId);
        List<String> columnIds = columns.stream()
                .map(com.qlda.backendjava.columns.entity.ColumnEntity::getId)
                .collect(Collectors.toList());

        // Get all tasks for these columns
        List<TaskEntity> tasks = new ArrayList<>();
        for (String columnId : columnIds) {
            tasks.addAll(taskRepository.findByColumnIdOrderByPositionAsc(columnId));
        }

        int totalTasks = tasks.size();
        long doneTasks = tasks.stream()
                .filter(t -> t.getStatus() == TaskEntity.Status.done)
                .count();
        int todoTasks = totalTasks - (int) doneTasks;

        LocalDateTime now = LocalDateTime.now();
        long overdueTasks = tasks.stream()
                .filter(t -> t.getDueDate() != null &&
                           t.getDueDate().isBefore(now) &&
                           t.getStatus() != TaskEntity.Status.done)
                .count();

        return new ProjectOverviewDto(
                (int) totalColumns,
                totalTasks,
                (int) doneTasks,
                todoTasks,
                (int) overdueTasks
        );
    }

    public List<ColumnStatisticsDto> getColumnStatistics(String projectId) {
        projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy dự án."));

        List<com.qlda.backendjava.columns.entity.ColumnEntity> columns = columnRepository.findByProjectId(projectId);

        return columns.stream()
                .map(column -> {
                    List<TaskEntity> tasks = taskRepository.findByColumnIdOrderByPositionAsc(column.getId());
                    int totalTasks = tasks.size();
                    long doneTasks = tasks.stream()
                            .filter(t -> t.getStatus() == TaskEntity.Status.done)
                            .count();
                    int todoTasks = totalTasks - (int) doneTasks;
                    double progress = totalTasks == 0 ? 0 : (doneTasks * 100.0 / totalTasks);

                    return new ColumnStatisticsDto(
                            column.getId(),
                            column.getName(),
                            totalTasks,
                            (int) doneTasks,
                            todoTasks,
                            Math.round(progress * 100.0) / 100.0
                    );
                })
                .collect(Collectors.toList());
    }

    public List<MemberStatisticsDto> getMemberStatistics(String projectId) {
        projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy dự án."));

        // Get all columns for this project
        List<com.qlda.backendjava.columns.entity.ColumnEntity> columns = columnRepository.findByProjectId(projectId);
        List<String> columnIds = columns.stream()
                .map(com.qlda.backendjava.columns.entity.ColumnEntity::getId)
                .collect(Collectors.toList());

        // Get all tasks for these columns
        List<TaskEntity> tasks = new ArrayList<>();
        for (String columnId : columnIds) {
            tasks.addAll(taskRepository.findByColumnIdOrderByPositionAsc(columnId));
        }

        Map<String, MemberStatisticsDto> userStatsMap = new HashMap<>();
        LocalDateTime now = LocalDateTime.now();

        for (TaskEntity task : tasks) {
            if (task.getAssignees() != null) {
                for (com.qlda.backendjava.users.entity.UserEntity assignee : task.getAssignees()) {
                    if (!userStatsMap.containsKey(assignee.getId())) {
                        userStatsMap.put(assignee.getId(), new MemberStatisticsDto(
                                assignee.getId(),
                                assignee.getName() != null ? assignee.getName() : assignee.getEmail(),
                                assignee.getAvatar() != null ? assignee.getAvatar() : "https://cdn-icons-png.flaticon.com/512/149/149071.png",
                                0, 0, 0, 0, 0.0
                        ));
                    }

                    MemberStatisticsDto stats = userStatsMap.get(assignee.getId());
                    stats.setTotalTasks(stats.getTotalTasks() + 1);

                    if (task.getStatus() == TaskEntity.Status.done) {
                        stats.setDoneTasks(stats.getDoneTasks() + 1);
                    } else {
                        stats.setTodoTasks(stats.getTodoTasks() + 1);
                        if (task.getDueDate() != null && task.getDueDate().isBefore(now)) {
                            stats.setOverdueTasks(stats.getOverdueTasks() + 1);
                        }
                    }
                }
            }
        }

        return userStatsMap.values().stream()
                .map(stats -> {
                    double completionRate = stats.getTotalTasks() == 0 ? 0 :
                            (stats.getDoneTasks() * 100.0 / stats.getTotalTasks());
                    stats.setCompletionRate(Math.round(completionRate * 100.0) / 100.0);
                    return stats;
                })
                .sorted((a, b) -> b.getTotalTasks() - a.getTotalTasks())
                .collect(Collectors.toList());
    }

    public List<TimelineStatisticsDto> getTimelineStatistics(String projectId, String period, 
                                                               LocalDateTime startDate, LocalDateTime endDate) {
        projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy dự án."));

        // Placeholder implementation - sẽ implement đầy đủ khi cần
        return List.of();
    }

    public CommentStatisticsDto getCommentStatistics(String projectId, String filter) {
        projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy dự án."));

        // Placeholder implementation - sẽ implement đầy đủ khi cần
        CommentStatisticsDto result = new CommentStatisticsDto();
        result.setTotalComments(0);
        result.setRecentComments(0);
        result.setCommentsByTask(List.of());
        result.setCommentsByMember(List.of());
        return result;
    }

    public DeadlineAnalyticsDto getDeadlineAnalytics(String projectId) {
        projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy dự án."));

        // Placeholder implementation - sẽ implement đầy đủ khi cần
        DeadlineAnalyticsDto result = new DeadlineAnalyticsDto();
        result.setOverdueTasks(0);
        result.setDueSoonTasks(0);
        result.setCompletedOnTime(0);
        result.setCompletedLate(0);
        result.setOverdueTasksList(List.of());
        result.setDueSoonTasksList(List.of());
        result.setCompletedOnTimeList(List.of());
        result.setCompletedLateList(List.of());
        return result;
    }
}

