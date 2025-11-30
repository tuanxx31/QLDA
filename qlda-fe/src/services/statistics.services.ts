import type {
  ProjectOverview,
  ColumnStatistics,
  MemberStatistics,
  TimelineStatistics,
  CommentStatistics,
  DeadlineAnalytics,
} from '@/types/statistics.type';
import { api } from './api';

export const statisticsService = {
  async getProjectOverview(projectId: string): Promise<ProjectOverview> {
    const res = await api.get<ProjectOverview>(
      `/projects/${projectId}/statistics/overview`,
    );
    return res.data;
  },

  async getColumnStatistics(projectId: string): Promise<ColumnStatistics[]> {
    const res = await api.get<ColumnStatistics[]>(
      `/projects/${projectId}/statistics/columns`,
    );
    return res.data;
  },

  async getMemberStatistics(projectId: string): Promise<MemberStatistics[]> {
    const res = await api.get<MemberStatistics[]>(
      `/projects/${projectId}/statistics/members`,
    );
    return res.data;
  },

  async getTimelineStatistics(
    projectId: string,
    params?: {
      period?: 'day' | 'week' | 'month';
      startDate?: string;
      endDate?: string;
    },
  ): Promise<TimelineStatistics[]> {
    const res = await api.get<TimelineStatistics[]>(
      `/projects/${projectId}/statistics/timeline`,
      { params },
    );
    return res.data;
  },

  async getCommentStatistics(
    projectId: string,
    filter?: '24h' | '7d' | 'all',
  ): Promise<CommentStatistics> {
    const res = await api.get<CommentStatistics>(
      `/projects/${projectId}/statistics/comments`,
      { params: { filter } },
    );
    return res.data;
  },

  async getDeadlineAnalytics(projectId: string): Promise<DeadlineAnalytics> {
    const res = await api.get<DeadlineAnalytics>(
      `/projects/${projectId}/statistics/deadlines`,
    );
    return res.data;
  },
};

