import { useState } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Card, Button, Space, Spin, message } from 'antd';
import { ArrowLeftOutlined, ReloadOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { projectService } from '@/services/project.services';
import { statisticsService } from '@/services/statistics.services';
import { usePageContentHeight } from '@/hooks/usePageContentHeight';
import OverviewSection from './components/statistics/OverviewSection';
import ColumnStatisticsChart from './components/statistics/ColumnStatisticsChart';
import MemberStatisticsTable from './components/statistics/MemberStatisticsTable';
import MemberPerformanceChart from './components/statistics/MemberPerformanceChart';
import TimelineChart from './components/statistics/TimelineChart';
import CommentStatisticsSection from './components/statistics/CommentStatisticsSection';
import DeadlineAnalyticsTable from './components/statistics/DeadlineAnalyticsTable';
import StatisticsTOC from './components/statistics/StatisticsTOC';

export default function StatisticsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { minHeight } = usePageContentHeight();

  const { data: project, isLoading: loadingProject } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => await projectService.getById(projectId!),
    enabled: !!projectId,
  });

  const { data: overview, isLoading: loadingOverview, refetch: refetchOverview } = useQuery({
    queryKey: ['statistics', 'overview', projectId],
    queryFn: () => statisticsService.getProjectOverview(projectId!),
    enabled: !!projectId,
  });

  const { data: projectProgress, isLoading: loadingProjectProgress, refetch: refetchProjectProgress } = useQuery({
    queryKey: ['projectProgress', projectId],
    queryFn: () => projectService.getProgress(projectId!),
    enabled: !!projectId,
  });

  const { data: columnStats, isLoading: loadingColumns, refetch: refetchColumns } = useQuery({
    queryKey: ['statistics', 'columns', projectId],
    queryFn: () => statisticsService.getColumnStatistics(projectId!),
    enabled: !!projectId,
  });

  const { data: columnProgress, isLoading: loadingColumnProgress, refetch: refetchColumnProgress } = useQuery({
    queryKey: ['columnProgress', projectId],
    queryFn: () => projectService.getColumnProgress(projectId!),
    enabled: !!projectId,
  });

  const { data: memberStats, isLoading: loadingMembers, refetch: refetchMembers } = useQuery({
    queryKey: ['statistics', 'members', projectId],
    queryFn: () => statisticsService.getMemberStatistics(projectId!),
    enabled: !!projectId,
  });

  const [timelineParams, setTimelineParams] = useState<{
    period?: 'day' | 'week' | 'month';
    startDate?: string;
    endDate?: string;
  }>({ period: 'day' });

  const { data: timelineStats, isLoading: loadingTimeline, refetch: refetchTimeline } = useQuery({
    queryKey: ['statistics', 'timeline', projectId, timelineParams],
    queryFn: () => statisticsService.getTimelineStatistics(projectId!, timelineParams),
    enabled: !!projectId,
  });

  const [commentFilter, setCommentFilter] = useState<'24h' | '7d' | 'all'>('all');

  const { data: commentStats, isLoading: loadingComments, refetch: refetchComments } = useQuery({
    queryKey: ['statistics', 'comments', projectId, commentFilter],
    queryFn: () => statisticsService.getCommentStatistics(projectId!, commentFilter),
    enabled: !!projectId,
  });

  const { data: deadlineStats, isLoading: loadingDeadlines, refetch: refetchDeadlines } = useQuery({
    queryKey: ['statistics', 'deadlines', projectId],
    queryFn: () => statisticsService.getDeadlineAnalytics(projectId!),
    enabled: !!projectId,
  });

  const { data: deadlineSummary, isLoading: loadingDeadlineSummary, refetch: refetchDeadlineSummary } = useQuery({
    queryKey: ['deadlineSummary', projectId],
    queryFn: () => projectService.getDeadlineSummary(projectId!),
    enabled: !!projectId,
  });

  const handleRefresh = async () => {
    message.loading({ content: 'Đang thực hiện mới dữ liệu...', key: 'refresh' });
    await Promise.all([
      refetchOverview(),
      refetchProjectProgress(),
      refetchColumns(),
      refetchColumnProgress(),
      refetchMembers(),
      refetchTimeline(),
      refetchComments(),
      refetchDeadlines(),
      refetchDeadlineSummary(),
    ]);
    message.success({ content: 'Đã làm mới dữ liệu', key: 'refresh' });
  };

  const isLoading =
    loadingProject ||
    loadingOverview ||
    loadingProjectProgress ||
    loadingColumns ||
    loadingColumnProgress ||
    loadingMembers ||
    loadingTimeline ||
    loadingComments ||
    loadingDeadlines ||
    loadingDeadlineSummary;

  if (loadingProject) {
    return (
      <PageContainer>
        <div style={{ textAlign: 'center', padding: '120px 0' }}>
          <Spin size="large" />
        </div>
      </PageContainer>
    );
  }

  if (!project) {
    return (
      <PageContainer title="Không tìm thấy dự án" onBack={() => navigate('/projects')}>
        <Card>Không thể tải thông tin dự án</Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title={
        <Space>
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(`/projects/${projectId}`)} />
          <span>Thống kê - {project.name}</span>
        </Space>
      }
      extra={
        <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={isLoading}>
          Làm mới
        </Button>
      }
    >
      <Card style={{ minHeight }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <StatisticsTOC />

          <OverviewSection
            data={overview}
            projectProgress={projectProgress}
            loading={loadingOverview || loadingProjectProgress}
          />

          <ColumnStatisticsChart
            data={columnStats}
            columnProgress={columnProgress}
            loading={loadingColumns || loadingColumnProgress}
          />

          <MemberStatisticsTable data={memberStats} loading={loadingMembers} />

          <MemberPerformanceChart data={memberStats} loading={loadingMembers} />

          <DeadlineAnalyticsTable
            data={deadlineStats}
            deadlineSummary={deadlineSummary}
            loading={loadingDeadlines || loadingDeadlineSummary}
          />

          <TimelineChart
            data={timelineStats}
            loading={loadingTimeline}
            onFilterChange={(params) => {
              setTimelineParams(params);
            }}
          />

          <CommentStatisticsSection
            data={commentStats}
            loading={loadingComments}
            onFilterChange={(filter) => {
              setCommentFilter(filter);
            }}
          />
        </Space>
      </Card>
    </PageContainer>
  );
}

