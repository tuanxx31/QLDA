import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Project } from 'src/projects/entities/project.entity';
import { Task } from 'src/tasks/entities/task.entity';
import { ColumnEntity } from 'src/columns/entities/column.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import { User } from 'src/users/entities/user.entity';
import { ProjectOverviewDto } from './dto/project-overview.dto';
import { ColumnStatisticsDto } from './dto/column-statistics.dto';
import { MemberStatisticsDto } from './dto/member-statistics.dto';
import { TimelineStatisticsDto } from './dto/timeline-statistics.dto';
import { CommentStatisticsDto, CommentByTaskDto, CommentByMemberDto } from './dto/comment-statistics.dto';
import { DeadlineAnalyticsDto, TaskDeadlineDto } from './dto/deadline-analytics.dto';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,

    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,

    @InjectRepository(ColumnEntity)
    private readonly columnRepo: Repository<ColumnEntity>,

    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async getProjectOverview(projectId: string): Promise<ProjectOverviewDto> {
    const project = await this.projectRepo.findOne({ where: { id: projectId } });
    if (!project) {
      throw new NotFoundException('Không tìm thấy dự án.');
    }

    const totalColumns = await this.columnRepo.count({
      where: { project: { id: projectId } },
    });

    const tasks = await this.taskRepo
      .createQueryBuilder('task')
      .innerJoin('task.column', 'column')
      .where('column.project_id = :projectId', { projectId })
      .getMany();

    const totalTasks = tasks.length;
    const doneTasks = tasks.filter((t) => t.status === 'done').length;
    const todoTasks = totalTasks - doneTasks;

    const now = new Date();
    const overdueTasks = tasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'done',
    ).length;

    return {
      totalColumns,
      totalTasks,
      doneTasks,
      todoTasks,
      overdueTasks,
    };
  }

  async getColumnStatistics(projectId: string): Promise<ColumnStatisticsDto[]> {
    const project = await this.projectRepo.findOne({ where: { id: projectId } });
    if (!project) {
      throw new NotFoundException('Không tìm thấy dự án.');
    }

    const columns = await this.columnRepo.find({
      where: { project: { id: projectId } },
      order: { order: 'ASC' },
    });

    const result = await Promise.all(
      columns.map(async (column) => {
        const tasks = await this.taskRepo.find({
          where: { columnId: column.id },
        });

        const totalTasks = tasks.length;
        const doneTasks = tasks.filter((t) => t.status === 'done').length;
        const todoTasks = totalTasks - doneTasks;
        const progress = totalTasks === 0 ? 0 : (doneTasks / totalTasks) * 100;

        return {
          columnId: column.id,
          columnName: column.name,
          totalTasks,
          doneTasks,
          todoTasks,
          progress: Math.round(progress * 100) / 100,
        };
      }),
    );

    return result;
  }

  async getMemberStatistics(projectId: string): Promise<MemberStatisticsDto[]> {
    const project = await this.projectRepo.findOne({ where: { id: projectId } });
    if (!project) {
      throw new NotFoundException('Không tìm thấy dự án.');
    }

    const tasks = await this.taskRepo
      .createQueryBuilder('task')
      .innerJoin('task.column', 'column')
      .leftJoinAndSelect('task.assignees', 'assignees')
      .where('column.project_id = :projectId', { projectId })
      .getMany();

    const userStatsMap = new Map<
      string,
      {
        userId: string;
        name: string;
        avatar: string;
        totalTasks: number;
        doneTasks: number;
        todoTasks: number;
        overdueTasks: number;
      }
    >();

    const now = new Date();

    for (const task of tasks) {
      if (task.assignees && task.assignees.length > 0) {
        for (const assignee of task.assignees) {
          if (!userStatsMap.has(assignee.id)) {
            userStatsMap.set(assignee.id, {
              userId: assignee.id,
              avatar: assignee.avatar || 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
              name: assignee.name || assignee.email,
              totalTasks: 0,
              doneTasks: 0,
              todoTasks: 0,
              overdueTasks: 0,
            });
          }

          const stats = userStatsMap.get(assignee.id)!;
          stats.totalTasks++;

          if (task.status === 'done') {
            stats.doneTasks++;
          } else {
            stats.todoTasks++;
            if (task.dueDate && new Date(task.dueDate) < now) {
              stats.overdueTasks++;
            }
          }
        }
      }
    }

    const result = Array.from(userStatsMap.values()).map((stats) => {
      const completionRate =
        stats.totalTasks === 0 ? 0 : (stats.doneTasks / stats.totalTasks) * 100;
      return {
        ...stats,
        completionRate: Math.round(completionRate * 100) / 100,
      };
    });

    return result.sort((a, b) => b.totalTasks - a.totalTasks);
  }

  async getTimelineStatistics(
    projectId: string,
    period: 'day' | 'week' | 'month' = 'day',
    startDate?: Date,
    endDate?: Date,
  ): Promise<TimelineStatisticsDto[]> {
    const project = await this.projectRepo.findOne({ where: { id: projectId } });
    if (!project) {
      throw new NotFoundException('Không tìm thấy dự án.');
    }

    const tasks = await this.taskRepo
      .createQueryBuilder('task')
      .innerJoin('task.column', 'column')
      .where('column.project_id = :projectId', { projectId })
      .getMany();

    const dateMap = new Map<string, TimelineStatisticsDto>();

    const now = startDate || new Date();
    const end = endDate || new Date();

    for (const task of tasks) {
      const createdDate = new Date(task.createdAt);
      const completedDate = task.completedAt ? new Date(task.completedAt) : null;
      const dueDate = task.dueDate ? new Date(task.dueDate) : null;

      let createdKey: string;
      let completedKey: string | null = null;

      if (period === 'day') {
        createdKey = createdDate.toISOString().split('T')[0];
        if (completedDate) {
          completedKey = completedDate.toISOString().split('T')[0];
        }
      } else if (period === 'week') {
        const weekStart = new Date(createdDate);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        createdKey = weekStart.toISOString().split('T')[0];
        if (completedDate) {
          const weekStartCompleted = new Date(completedDate);
          weekStartCompleted.setDate(weekStartCompleted.getDate() - weekStartCompleted.getDay());
          completedKey = weekStartCompleted.toISOString().split('T')[0];
        }
      } else {
        createdKey = `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, '0')}`;
        if (completedDate) {
          completedKey = `${completedDate.getFullYear()}-${String(completedDate.getMonth() + 1).padStart(2, '0')}`;
        }
      }

      if (!dateMap.has(createdKey)) {
        dateMap.set(createdKey, {
          date: createdKey,
          createdTasks: 0,
          completedTasks: 0,
          onTimeTasks: 0,
          lateTasks: 0,
        });
      }
      dateMap.get(createdKey)!.createdTasks++;

      if (completedKey && task.status === 'done') {
        if (!dateMap.has(completedKey)) {
          dateMap.set(completedKey, {
            date: completedKey,
            createdTasks: 0,
            completedTasks: 0,
            onTimeTasks: 0,
            lateTasks: 0,
          });
        }
        const stats = dateMap.get(completedKey)!;
        stats.completedTasks++;

        if (dueDate && completedDate) {
          if (completedDate <= dueDate) {
            stats.onTimeTasks++;
          } else {
            stats.lateTasks++;
          }
        }
      }
    }

    const result = Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));
    return result;
  }

  async getCommentStatistics(
    projectId: string,
    filter?: '24h' | '7d' | 'all',
  ): Promise<CommentStatisticsDto> {
    const project = await this.projectRepo.findOne({ where: { id: projectId } });
    if (!project) {
      throw new NotFoundException('Không tìm thấy dự án.');
    }

    const tasks = await this.taskRepo
      .createQueryBuilder('task')
      .innerJoin('task.column', 'column')
      .where('column.project_id = :projectId', { projectId })
      .getMany();

    const taskIds = tasks.map((t) => t.id);

    if (taskIds.length === 0) {
      return {
        totalComments: 0,
        recentComments: 0,
        commentsByTask: [],
        commentsByMember: [],
      };
    }

    let commentsQuery = this.commentRepo
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoinAndSelect('comment.task', 'task')
      .where('comment.taskId IN (:...taskIds)', { taskIds });

    if (filter === '24h') {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      commentsQuery = commentsQuery.andWhere('comment.createdAt >= :yesterday', { yesterday });
    } else if (filter === '7d') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      commentsQuery = commentsQuery.andWhere('comment.createdAt >= :sevenDaysAgo', {
        sevenDaysAgo,
      });
    }

    const comments = await commentsQuery.getMany();

    const totalComments = comments.length;

    let recentComments = 0;
    if (filter === '24h') {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      recentComments = comments.filter((c) => new Date(c.createdAt) >= yesterday).length;
    } else if (filter === '7d') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      recentComments = comments.filter((c) => new Date(c.createdAt) >= sevenDaysAgo).length;
    } else {
      recentComments = totalComments;
    }

    const commentsByTaskMap = new Map<string, { taskId: string; taskTitle: string; count: number }>();
    const commentsByMemberMap = new Map<
      string,
      { userId: string; userName: string; avatar: string; count: number }
    >();

    for (const comment of comments) {
      if (comment.task) {
        const taskId = comment.task.id;
        if (!commentsByTaskMap.has(taskId)) {
          commentsByTaskMap.set(taskId, {
            taskId,
            taskTitle: comment.task.title || 'Untitled',
            count: 0,
          });
        }
        commentsByTaskMap.get(taskId)!.count++;
      }

      if (comment.user) {
        const userId = comment.user.id;
        if (!commentsByMemberMap.has(userId)) {
          commentsByMemberMap.set(userId, {
            userId,
            userName: comment.user.name || comment.user.email,
            avatar: comment.user.avatar || 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
            count: 0,
          });
        }
        commentsByMemberMap.get(userId)!.count++;
      }
    }

    const commentsByTask: CommentByTaskDto[] = Array.from(commentsByTaskMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map((item) => ({
        taskId: item.taskId,
        taskTitle: item.taskTitle,
        commentCount: item.count,
      }));

    const commentsByMember: CommentByMemberDto[] = Array.from(commentsByMemberMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map((item) => ({
        userId: item.userId,
        userName: item.userName,
        avatar: item.avatar,
        commentCount: item.count,
      }));

    return {
      totalComments,
      recentComments,
      commentsByTask,
      commentsByMember,
    };
  }

  async getDeadlineAnalytics(projectId: string): Promise<DeadlineAnalyticsDto> {
    const project = await this.projectRepo.findOne({ where: { id: projectId } });
    if (!project) {
      throw new NotFoundException('Không tìm thấy dự án.');
    }

    const tasks = await this.taskRepo
      .createQueryBuilder('task')
      .innerJoin('task.column', 'column')
      .where('column.project_id = :projectId', { projectId })
      .andWhere('task.dueDate IS NOT NULL')
      .getMany();

    const now = new Date();
    const threeDaysLater = new Date(now);
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);

    const overdueTasksList: TaskDeadlineDto[] = [];
    const dueSoonTasksList: TaskDeadlineDto[] = [];
    const completedOnTimeList: TaskDeadlineDto[] = [];
    const completedLateList: TaskDeadlineDto[] = [];

    for (const task of tasks) {
      if (!task.dueDate) continue;

      const dueDate = new Date(task.dueDate);
      const isOverdue = dueDate < now && task.status !== 'done';
      const isDueSoon =
        dueDate >= now && dueDate <= threeDaysLater && task.status !== 'done';

      const taskDto: TaskDeadlineDto = {
        taskId: task.id,
        taskTitle: task.title,
        dueDate: task.dueDate,
        status: task.status,
        completedAt: task.completedAt || null,
      };

      if (isOverdue) {
        overdueTasksList.push(taskDto);
      } else if (isDueSoon) {
        dueSoonTasksList.push(taskDto);
      } else if (task.status === 'done' && task.completedAt) {
        const completedAt = new Date(task.completedAt);
        if (completedAt <= dueDate) {
          completedOnTimeList.push(taskDto);
        } else {
          completedLateList.push(taskDto);
        }
      }
    }

    return {
      overdueTasks: overdueTasksList.length,
      dueSoonTasks: dueSoonTasksList.length,
      completedOnTime: completedOnTimeList.length,
      completedLate: completedLateList.length,
      overdueTasksList,
      dueSoonTasksList,
      completedOnTimeList,
      completedLateList,
    };
  }
}

