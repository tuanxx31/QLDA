import { Test, TestingModule } from '@nestjs/testing';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { ProjectOverviewDto } from './dto/project-overview.dto';
import { ColumnStatisticsDto } from './dto/column-statistics.dto';
import { MemberStatisticsDto } from './dto/member-statistics.dto';
import { TimelineStatisticsDto } from './dto/timeline-statistics.dto';
import { CommentStatisticsDto } from './dto/comment-statistics.dto';
import { DeadlineAnalyticsDto } from './dto/deadline-analytics.dto';
import { AuthGuard } from 'src/auth/auth.guard';

describe('StatisticsController', () => {
  let controller: StatisticsController;
  let service: StatisticsService;

  const mockStatisticsService = {
    getProjectOverview: jest.fn(),
    getColumnStatistics: jest.fn(),
    getMemberStatistics: jest.fn(),
    getTimelineStatistics: jest.fn(),
    getCommentStatistics: jest.fn(),
    getDeadlineAnalytics: jest.fn(),
  };

  const mockAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatisticsController],
      providers: [
        {
          provide: StatisticsService,
          useValue: mockStatisticsService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    controller = module.get<StatisticsController>(StatisticsController);
    service = module.get<StatisticsService>(StatisticsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProjectOverview', () => {
    it('should return project overview', async () => {
      const projectId = 'project-1';
      const mockOverview: ProjectOverviewDto = {
        totalColumns: 5,
        totalTasks: 50,
        doneTasks: 30,
        todoTasks: 20,
        overdueTasks: 5,
      };

      mockStatisticsService.getProjectOverview.mockResolvedValue(mockOverview);

      const result = await controller.getProjectOverview(projectId);

      expect(result).toEqual(mockOverview);
      expect(service.getProjectOverview).toHaveBeenCalledWith(projectId);
    });
  });

  describe('getColumnStatistics', () => {
    it('should return column statistics', async () => {
      const projectId = 'project-1';
      const mockColumnStats: ColumnStatisticsDto[] = [
        {
          columnId: 'column-1',
          columnName: 'To Do',
          totalTasks: 10,
          doneTasks: 5,
          todoTasks: 5,
          progress: 50.0,
        },
      ];

      mockStatisticsService.getColumnStatistics.mockResolvedValue(
        mockColumnStats,
      );

      const result = await controller.getColumnStatistics(projectId);

      expect(result).toEqual(mockColumnStats);
      expect(service.getColumnStatistics).toHaveBeenCalledWith(projectId);
    });
  });

  describe('getMemberStatistics', () => {
    it('should return member statistics', async () => {
      const projectId = 'project-1';
      const mockMemberStats: MemberStatisticsDto[] = [
        {
          userId: 'user-1',
          name: 'User 1',
          avatar: 'https://example.com/avatar.jpg',
          totalTasks: 15,
          doneTasks: 10,
          todoTasks: 5,
          overdueTasks: 2,
          completionRate: 66.67,
        },
      ];

      mockStatisticsService.getMemberStatistics.mockResolvedValue(
        mockMemberStats,
      );

      const result = await controller.getMemberStatistics(projectId);

      expect(result).toEqual(mockMemberStats);
      expect(service.getMemberStatistics).toHaveBeenCalledWith(projectId);
    });
  });

  describe('getTimelineStatistics', () => {
    it('should return timeline statistics with default period', async () => {
      const projectId = 'project-1';
      const mockTimelineStats: TimelineStatisticsDto[] = [
        {
          date: '2024-01-15',
          createdTasks: 5,
          completedTasks: 3,
          onTimeTasks: 2,
          lateTasks: 1,
        },
      ];

      mockStatisticsService.getTimelineStatistics.mockResolvedValue(
        mockTimelineStats,
      );

      const result = await controller.getTimelineStatistics(projectId);

      expect(result).toEqual(mockTimelineStats);
      expect(service.getTimelineStatistics).toHaveBeenCalledWith(
        projectId,
        'day',
        undefined,
        undefined,
      );
    });

    it('should return timeline statistics with custom period and dates', async () => {
      const projectId = 'project-1';
      const period = 'week';
      const startDate = '2024-01-01';
      const endDate = '2024-01-31';
      const mockTimelineStats: TimelineStatisticsDto[] = [];

      mockStatisticsService.getTimelineStatistics.mockResolvedValue(
        mockTimelineStats,
      );

      const result = await controller.getTimelineStatistics(
        projectId,
        period,
        startDate,
        endDate,
      );

      expect(result).toEqual(mockTimelineStats);
      expect(service.getTimelineStatistics).toHaveBeenCalledWith(
        projectId,
        period,
        new Date(startDate),
        new Date(endDate),
      );
    });
  });

  describe('getCommentStatistics', () => {
    it('should return comment statistics without filter', async () => {
      const projectId = 'project-1';
      const mockCommentStats: CommentStatisticsDto = {
        totalComments: 100,
        recentComments: 100,
        commentsByTask: [],
        commentsByMember: [],
      };

      mockStatisticsService.getCommentStatistics.mockResolvedValue(
        mockCommentStats,
      );

      const result = await controller.getCommentStatistics(projectId);

      expect(result).toEqual(mockCommentStats);
      expect(service.getCommentStatistics).toHaveBeenCalledWith(
        projectId,
        undefined,
      );
    });

    it('should return comment statistics with filter', async () => {
      const projectId = 'project-1';
      const filter = '24h';
      const mockCommentStats: CommentStatisticsDto = {
        totalComments: 5,
        recentComments: 5,
        commentsByTask: [],
        commentsByMember: [],
      };

      mockStatisticsService.getCommentStatistics.mockResolvedValue(
        mockCommentStats,
      );

      const result = await controller.getCommentStatistics(projectId, filter);

      expect(result).toEqual(mockCommentStats);
      expect(service.getCommentStatistics).toHaveBeenCalledWith(
        projectId,
        filter,
      );
    });
  });

  describe('getDeadlineAnalytics', () => {
    it('should return deadline analytics', async () => {
      const projectId = 'project-1';
      const mockDeadlineAnalytics: DeadlineAnalyticsDto = {
        overdueTasks: 5,
        dueSoonTasks: 3,
        completedOnTime: 10,
        completedLate: 2,
        overdueTasksList: [],
        dueSoonTasksList: [],
        completedOnTimeList: [],
        completedLateList: [],
      };

      mockStatisticsService.getDeadlineAnalytics.mockResolvedValue(
        mockDeadlineAnalytics,
      );

      const result = await controller.getDeadlineAnalytics(projectId);

      expect(result).toEqual(mockDeadlineAnalytics);
      expect(service.getDeadlineAnalytics).toHaveBeenCalledWith(projectId);
    });
  });
});

