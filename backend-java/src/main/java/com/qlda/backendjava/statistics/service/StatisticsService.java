package com.qlda.backendjava.statistics.service;

import com.qlda.backendjava.common.exception.ForbiddenException;
import com.qlda.backendjava.common.exception.NotFoundException;
import com.qlda.backendjava.columns.repository.ColumnRepository;
import com.qlda.backendjava.comments.entity.CommentEntity;
import com.qlda.backendjava.comments.repository.CommentRepository;
import com.qlda.backendjava.projectmember.entity.ProjectMemberEntity;
import com.qlda.backendjava.projectmember.repository.ProjectMemberRepository;
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
import java.time.DayOfWeek;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatisticsService {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final ColumnRepository columnRepository;
    private final CommentRepository commentRepository;
    private final ProjectMemberRepository projectMemberRepository;

    public ProjectOverviewDto getProjectOverview(String projectId, String userId) {
        ensureUserIsProjectMember(projectId, userId);
        
        ProjectEntity project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy dự án."));

        long totalColumns = columnRepository.findByProjectId(projectId).size();

        
        List<com.qlda.backendjava.columns.entity.ColumnEntity> columns = columnRepository.findByProjectId(projectId);
        List<String> columnIds = columns.stream()
                .map(com.qlda.backendjava.columns.entity.ColumnEntity::getId)
                .collect(Collectors.toList());

        
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

    public List<ColumnStatisticsDto> getColumnStatistics(String projectId, String userId) {
        ensureUserIsProjectMember(projectId, userId);

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

    public List<MemberStatisticsDto> getMemberStatistics(String projectId, String userId) {
        ensureUserIsProjectMember(projectId, userId);

        
        List<com.qlda.backendjava.columns.entity.ColumnEntity> columns = columnRepository.findByProjectId(projectId);
        List<String> columnIds = columns.stream()
                .map(com.qlda.backendjava.columns.entity.ColumnEntity::getId)
                .collect(Collectors.toList());

        
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
                                                               LocalDateTime startDate, LocalDateTime endDate, String userId) {
        ensureUserIsProjectMember(projectId, userId);

        
        List<com.qlda.backendjava.columns.entity.ColumnEntity> columns = columnRepository.findByProjectId(projectId);
        List<String> columnIds = columns.stream()
                .map(com.qlda.backendjava.columns.entity.ColumnEntity::getId)
                .collect(Collectors.toList());

        
        List<TaskEntity> tasks = new ArrayList<>();
        for (String columnId : columnIds) {
            tasks.addAll(taskRepository.findByColumnIdOrderByPositionAsc(columnId));
        }

        Map<String, TimelineStatisticsDto> dateMap = new HashMap<>();

        for (TaskEntity task : tasks) {
            LocalDateTime createdDate = task.getCreatedAt();
            LocalDateTime completedDate = task.getCompletedAt();
            LocalDateTime dueDate = task.getDueDate();

            String createdKey = formatDateByPeriod(createdDate, period);
            String completedKey = completedDate != null ? formatDateByPeriod(completedDate, period) : null;

            
            if (!dateMap.containsKey(createdKey)) {
                dateMap.put(createdKey, new TimelineStatisticsDto(
                        createdKey, 0, 0, 0, 0
                ));
            }
            TimelineStatisticsDto createdStats = dateMap.get(createdKey);
            createdStats.setCreatedTasks(createdStats.getCreatedTasks() + 1);

            
            if (completedKey != null && task.getStatus() == TaskEntity.Status.done) {
                if (!dateMap.containsKey(completedKey)) {
                    dateMap.put(completedKey, new TimelineStatisticsDto(
                            completedKey, 0, 0, 0, 0
                    ));
                }
                TimelineStatisticsDto completedStats = dateMap.get(completedKey);
                completedStats.setCompletedTasks(completedStats.getCompletedTasks() + 1);

                
                if (dueDate != null && completedDate != null) {
                    if (!completedDate.isAfter(dueDate)) {
                        completedStats.setOnTimeTasks(completedStats.getOnTimeTasks() + 1);
                    } else {
                        completedStats.setLateTasks(completedStats.getLateTasks() + 1);
                    }
                }
            }
        }

        return dateMap.values().stream()
                .sorted(Comparator.comparing(TimelineStatisticsDto::getDate))
                .collect(Collectors.toList());
    }

    private String formatDateByPeriod(LocalDateTime date, String period) {
        if (period == null || period.equals("day")) {
            return date.toLocalDate().toString(); 
        } else if (period.equals("week")) {
            
            LocalDateTime weekStart = date.with(TemporalAdjusters.previousOrSame(DayOfWeek.SUNDAY));
            return weekStart.toLocalDate().toString(); 
        } else if (period.equals("month")) {
            
            return String.format("%d-%02d", date.getYear(), date.getMonthValue());
        } else {
            
            return date.toLocalDate().toString();
        }
    }

    public CommentStatisticsDto getCommentStatistics(String projectId, String filter, String userId) {
        ensureUserIsProjectMember(projectId, userId);

        
        List<com.qlda.backendjava.columns.entity.ColumnEntity> columns = columnRepository.findByProjectId(projectId);
        List<String> columnIds = columns.stream()
                .map(com.qlda.backendjava.columns.entity.ColumnEntity::getId)
                .collect(Collectors.toList());

        
        List<TaskEntity> tasks = new ArrayList<>();
        for (String columnId : columnIds) {
            tasks.addAll(taskRepository.findByColumnIdOrderByPositionAsc(columnId));
        }

        List<String> taskIds = tasks.stream()
                .map(TaskEntity::getId)
                .collect(Collectors.toList());

        if (taskIds.isEmpty()) {
            return new CommentStatisticsDto(0, 0, List.of(), List.of());
        }

        
        LocalDateTime startDate = null;
        if (filter != null && filter.equals("24h")) {
            startDate = LocalDateTime.now().minusDays(1);
        } else if (filter != null && filter.equals("7d")) {
            startDate = LocalDateTime.now().minusDays(7);
        }

        
        List<CommentEntity> comments = commentRepository.findByTaskIdsAndCreatedAtAfter(taskIds, startDate);

        int totalComments = comments.size();

        
        int recentComments;
        if (filter != null && filter.equals("24h")) {
            LocalDateTime yesterday = LocalDateTime.now().minusDays(1);
            recentComments = (int) comments.stream()
                    .filter(c -> c.getCreatedAt() != null && !c.getCreatedAt().isBefore(yesterday))
                    .count();
        } else if (filter != null && filter.equals("7d")) {
            LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
            recentComments = (int) comments.stream()
                    .filter(c -> c.getCreatedAt() != null && !c.getCreatedAt().isBefore(sevenDaysAgo))
                    .count();
        } else {
            recentComments = totalComments;
        }

        
        Map<String, CommentByTaskDto> commentsByTaskMap = new HashMap<>();
        for (CommentEntity comment : comments) {
            if (comment.getTask() != null) {
                String taskId = comment.getTask().getId();
                if (!commentsByTaskMap.containsKey(taskId)) {
                    commentsByTaskMap.put(taskId, new CommentByTaskDto(
                            taskId,
                            comment.getTask().getTitle() != null ? comment.getTask().getTitle() : "Untitled",
                            0
                    ));
                }
                CommentByTaskDto taskDto = commentsByTaskMap.get(taskId);
                taskDto.setCommentCount(taskDto.getCommentCount() + 1);
            }
        }

        
        Map<String, CommentByMemberDto> commentsByMemberMap = new HashMap<>();
        for (CommentEntity comment : comments) {
            if (comment.getUser() != null) {
                String commentUserId = comment.getUser().getId();
                if (!commentsByMemberMap.containsKey(commentUserId)) {
                    String userName = comment.getUser().getName() != null 
                            ? comment.getUser().getName() 
                            : comment.getUser().getEmail();
                    String avatar = comment.getUser().getAvatar() != null 
                            ? comment.getUser().getAvatar() 
                            : "https://cdn-icons-png.flaticon.com/512/149/149071.png";
                    commentsByMemberMap.put(commentUserId, new CommentByMemberDto(
                            commentUserId,
                            userName,
                            avatar,
                            0
                    ));
                }
                CommentByMemberDto memberDto = commentsByMemberMap.get(commentUserId);
                memberDto.setCommentCount(memberDto.getCommentCount() + 1);
            }
        }

        
        List<CommentByTaskDto> commentsByTask = commentsByTaskMap.values().stream()
                .sorted((a, b) -> b.getCommentCount().compareTo(a.getCommentCount()))
                .limit(10)
                .collect(Collectors.toList());

        List<CommentByMemberDto> commentsByMember = commentsByMemberMap.values().stream()
                .sorted((a, b) -> b.getCommentCount().compareTo(a.getCommentCount()))
                .limit(10)
                .collect(Collectors.toList());

        return new CommentStatisticsDto(
                totalComments,
                recentComments,
                commentsByTask,
                commentsByMember
        );
    }

    public DeadlineAnalyticsDto getDeadlineAnalytics(String projectId, String userId) {
        ensureUserIsProjectMember(projectId, userId);

        
        List<com.qlda.backendjava.columns.entity.ColumnEntity> columns = columnRepository.findByProjectId(projectId);
        List<String> columnIds = columns.stream()
                .map(com.qlda.backendjava.columns.entity.ColumnEntity::getId)
                .collect(Collectors.toList());

        
        List<TaskEntity> tasks = new ArrayList<>();
        for (String columnId : columnIds) {
            tasks.addAll(taskRepository.findByColumnIdOrderByPositionAsc(columnId).stream()
                    .filter(t -> t.getDueDate() != null)
                    .collect(Collectors.toList()));
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime threeDaysLater = now.plusDays(3);

        List<TaskDeadlineDto> overdueTasksList = new ArrayList<>();
        List<TaskDeadlineDto> dueSoonTasksList = new ArrayList<>();
        List<TaskDeadlineDto> completedOnTimeList = new ArrayList<>();
        List<TaskDeadlineDto> completedLateList = new ArrayList<>();

        for (TaskEntity task : tasks) {
            if (task.getDueDate() == null) continue;

            LocalDateTime dueDate = task.getDueDate();
            boolean isOverdue = dueDate.isBefore(now) && task.getStatus() != TaskEntity.Status.done;
            boolean isDueSoon = !dueDate.isBefore(now) && !dueDate.isAfter(threeDaysLater) 
                    && task.getStatus() != TaskEntity.Status.done;

            TaskDeadlineDto taskDto = new TaskDeadlineDto(
                    task.getId(),
                    task.getTitle(),
                    task.getDueDate(),
                    task.getStatus().name(),
                    task.getCompletedAt()
            );

            if (isOverdue) {
                overdueTasksList.add(taskDto);
            } else if (isDueSoon) {
                dueSoonTasksList.add(taskDto);
            } else if (task.getStatus() == TaskEntity.Status.done && task.getCompletedAt() != null) {
                LocalDateTime completedAt = task.getCompletedAt();
                if (!completedAt.isAfter(dueDate)) {
                    completedOnTimeList.add(taskDto);
                } else {
                    completedLateList.add(taskDto);
                }
            }
        }

        return new DeadlineAnalyticsDto(
                overdueTasksList.size(),
                dueSoonTasksList.size(),
                completedOnTimeList.size(),
                completedLateList.size(),
                overdueTasksList,
                dueSoonTasksList,
                completedOnTimeList,
                completedLateList
        );
    }

    
    private void ensureUserIsProjectMember(String projectId, String userId) {
        ProjectEntity project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy dự án."));
        
        
        if (project.getOwner().getId().equals(userId)) {
            return;
        }
        
        
        boolean isMember = projectMemberRepository.existsByProjectIdAndUserId(projectId, userId);
        
        if (!isMember) {
            throw new ForbiddenException("Bạn không có quyền truy cập dự án này.");
        }
    }
}

