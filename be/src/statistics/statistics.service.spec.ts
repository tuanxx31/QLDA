import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StatisticsService } from './statistics.service';
import { Project } from 'src/projects/entities/project.entity';
import { Task } from 'src/tasks/entities/task.entity';
import { ColumnEntity } from 'src/columns/entities/column.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import { User } from 'src/users/entities/user.entity';
import { NotFoundException } from '@nestjs/common';

describe('StatisticsService', () => {
  let service: StatisticsService;
  let projectRepo: Repository<Project>;
  let taskRepo: Repository<Task>;
  let columnRepo: Repository<ColumnEntity>;
  let commentRepo: Repository<Comment>;
  let userRepo: Repository<User>;

  const mockProjectRepo = {
    findOne: jest.fn(),
  };

  const mockTaskRepo = {
    createQueryBuilder: jest.fn(),
    find: jest.fn(),
  };

  const mockColumnRepo = {
    count: jest.fn(),
    find: jest.fn(),
  };

  const mockCommentRepo = {
    createQueryBuilder: jest.fn(),
  };

  const mockUserRepo = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatisticsService,
        {
          provide: getRepositoryToken(Project),
          useValue: mockProjectRepo,
        },
        {
          provide: getRepositoryToken(Task),
          useValue: mockTaskRepo,
        },
        {
          provide: getRepositoryToken(ColumnEntity),
          useValue: mockColumnRepo,
        },
        {
          provide: getRepositoryToken(Comment),
          useValue: mockCommentRepo,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepo,
        },
      ],
    }).compile();

    service = module.get<StatisticsService>(StatisticsService);
    projectRepo = module.get<Repository<Project>>(getRepositoryToken(Project));
    taskRepo = module.get<Repository<Task>>(getRepositoryToken(Task));
    columnRepo = module.get<Repository<ColumnEntity>>(
      getRepositoryToken(ColumnEntity),
    );
    commentRepo = module.get<Repository<Comment>>(getRepositoryToken(Comment));
    userRepo = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProjectOverview', () => {
    const projectId = 'project-1';

    it('should return project overview statistics', async () => {
      const mockProject = { id: projectId };
      const mockTasks = [
        { id: 'task-1', status: 'done', dueDate: null },
        { id: 'task-2', status: 'todo', dueDate: null },
        {
          id: 'task-3',
          status: 'todo',
          dueDate: new Date(Date.now() - 86400000), 
        },
      ];
      const mockQueryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockTasks),
      };

      mockProjectRepo.findOne.mockResolvedValue(mockProject);
      mockColumnRepo.count.mockResolvedValue(3);
      mockTaskRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getProjectOverview(projectId);

      expect(result.totalColumns).toBe(3);
      expect(result.totalTasks).toBe(3);
      expect(result.doneTasks).toBe(1);
      expect(result.todoTasks).toBe(2);
      expect(result.overdueTasks).toBe(1);
    });

    it('should throw NotFoundException if project not found', async () => {
      mockProjectRepo.findOne.mockResolvedValue(null);

      await expect(service.getProjectOverview(projectId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getColumnStatistics', () => {
    const projectId = 'project-1';

    it('should return column statistics', async () => {
      const mockProject = { id: projectId };
      const mockColumns = [
        { id: 'column-1', name: 'To Do', order: 0 },
        { id: 'column-2', name: 'Done', order: 1 },
      ];
      const mockTasks1 = [
        { id: 'task-1', status: 'done' },
        { id: 'task-2', status: 'todo' },
      ];
      const mockTasks2 = [{ id: 'task-3', status: 'done' }];

      mockProjectRepo.findOne.mockResolvedValue(mockProject);
      mockColumnRepo.find.mockResolvedValue(mockColumns);
      mockTaskRepo.find
        .mockResolvedValueOnce(mockTasks1)
        .mockResolvedValueOnce(mockTasks2);

      const result = await service.getColumnStatistics(projectId);

      expect(result).toHaveLength(2);
      expect(result[0].columnId).toBe('column-1');
      expect(result[0].totalTasks).toBe(2);
      expect(result[0].doneTasks).toBe(1);
      expect(result[0].todoTasks).toBe(1);
      expect(result[0].progress).toBe(50);
    });

    it('should throw NotFoundException if project not found', async () => {
      mockProjectRepo.findOne.mockResolvedValue(null);

      await expect(service.getColumnStatistics(projectId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getMemberStatistics', () => {
    const projectId = 'project-1';

    it('should return member statistics', async () => {
      const mockProject = { id: projectId };
      const mockUser1 = {
        id: 'user-1',
        name: 'User 1',
        email: 'user1@example.com',
        avatar: null,
      };
      const mockUser2 = {
        id: 'user-2',
        name: 'User 2',
        email: 'user2@example.com',
        avatar: null,
      };
      const mockTasks = [
        {
          id: 'task-1',
          status: 'done',
          dueDate: null,
          assignees: [mockUser1],
        },
        {
          id: 'task-2',
          status: 'todo',
          dueDate: new Date(Date.now() - 86400000),
          assignees: [mockUser1, mockUser2],
        },
        {
          id: 'task-3',
          status: 'done',
          dueDate: null,
          assignees: [mockUser2],
        },
      ];
      const mockQueryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockTasks),
      };

      mockProjectRepo.findOne.mockResolvedValue(mockProject);
      mockTaskRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getMemberStatistics(projectId);

      expect(result).toHaveLength(2);
      expect(result[0].userId).toBe('user-1');
      expect(result[0].totalTasks).toBe(2);
      expect(result[0].doneTasks).toBe(1);
      expect(result[0].todoTasks).toBe(1);
      expect(result[0].overdueTasks).toBe(1);
    });

    it('should throw NotFoundException if project not found', async () => {
      mockProjectRepo.findOne.mockResolvedValue(null);

      await expect(service.getMemberStatistics(projectId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getTimelineStatistics', () => {
    const projectId = 'project-1';

    it('should return timeline statistics for day period', async () => {
      const mockProject = { id: projectId };
      const now = new Date();
      const yesterday = new Date(now.getTime() - 86400000);
      const mockTasks = [
        {
          id: 'task-1',
          status: 'done',
          createdAt: yesterday,
          completedAt: yesterday,
          dueDate: yesterday,
        },
        {
          id: 'task-2',
          status: 'todo',
          createdAt: now,
          completedAt: null,
          dueDate: null,
        },
      ];
      const mockQueryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockTasks),
      };

      mockProjectRepo.findOne.mockResolvedValue(mockProject);
      mockTaskRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getTimelineStatistics(
        projectId,
        'day',
        undefined,
        undefined,
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return timeline statistics for week period', async () => {
      const mockProject = { id: projectId };
      const mockTasks = [];
      const mockQueryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockTasks),
      };

      mockProjectRepo.findOne.mockResolvedValue(mockProject);
      mockTaskRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getTimelineStatistics(
        projectId,
        'week',
        undefined,
        undefined,
      );

      expect(result).toBeDefined();
    });

    it('should return timeline statistics for month period', async () => {
      const mockProject = { id: projectId };
      const mockTasks = [];
      const mockQueryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockTasks),
      };

      mockProjectRepo.findOne.mockResolvedValue(mockProject);
      mockTaskRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getTimelineStatistics(
        projectId,
        'month',
        undefined,
        undefined,
      );

      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if project not found', async () => {
      mockProjectRepo.findOne.mockResolvedValue(null);

      await expect(
        service.getTimelineStatistics(projectId, 'day'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getCommentStatistics', () => {
    const projectId = 'project-1';

    it('should return comment statistics without filter', async () => {
      const mockProject = { id: projectId };
      const mockTasks = [{ id: 'task-1' }, { id: 'task-2' }];
      const mockComments = [
        {
          id: 'comment-1',
          task: { id: 'task-1', title: 'Task 1' },
          user: {
            id: 'user-1',
            name: 'User 1',
            email: 'user1@example.com',
            avatar: null,
          },
          createdAt: new Date(),
        },
        {
          id: 'comment-2',
          task: { id: 'task-1', title: 'Task 1' },
          user: {
            id: 'user-1',
            name: 'User 1',
            email: 'user1@example.com',
            avatar: null,
          },
          createdAt: new Date(),
        },
      ];

      const mockTaskQueryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockTasks),
      };

      const mockCommentQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockComments),
      };

      mockProjectRepo.findOne.mockResolvedValue(mockProject);
      mockTaskRepo.createQueryBuilder.mockReturnValue(mockTaskQueryBuilder);
      mockCommentRepo.createQueryBuilder.mockReturnValue(mockCommentQueryBuilder);

      const result = await service.getCommentStatistics(projectId);

      expect(result.totalComments).toBe(2);
      expect(result.recentComments).toBe(2);
      expect(result.commentsByTask).toBeDefined();
      expect(result.commentsByMember).toBeDefined();
    });

    it('should return comment statistics with 24h filter', async () => {
      const mockProject = { id: projectId };
      const mockTasks = [{ id: 'task-1' }];
      const mockComments = [];

      const mockTaskQueryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockTasks),
      };

      const mockCommentQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockComments),
      };

      mockProjectRepo.findOne.mockResolvedValue(mockProject);
      mockTaskRepo.createQueryBuilder.mockReturnValue(mockTaskQueryBuilder);
      mockCommentRepo.createQueryBuilder.mockReturnValue(mockCommentQueryBuilder);

      const result = await service.getCommentStatistics(projectId, '24h');

      expect(result.totalComments).toBe(0);
      expect(result.recentComments).toBe(0);
    });

    it('should return empty statistics if no tasks', async () => {
      const mockProject = { id: projectId };
      const mockTasks = [];

      const mockTaskQueryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockTasks),
      };

      mockProjectRepo.findOne.mockResolvedValue(mockProject);
      mockTaskRepo.createQueryBuilder.mockReturnValue(mockTaskQueryBuilder);

      const result = await service.getCommentStatistics(projectId);

      expect(result.totalComments).toBe(0);
      expect(result.recentComments).toBe(0);
      expect(result.commentsByTask).toEqual([]);
      expect(result.commentsByMember).toEqual([]);
    });

    it('should throw NotFoundException if project not found', async () => {
      mockProjectRepo.findOne.mockResolvedValue(null);

      await expect(service.getCommentStatistics(projectId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getDeadlineAnalytics', () => {
    const projectId = 'project-1';

    it('should return deadline analytics', async () => {
      const mockProject = { id: projectId };
      const now = new Date();
      const yesterday = new Date(now.getTime() - 86400000);
      const tomorrow = new Date(now.getTime() + 86400000);
      const twoDaysLater = new Date(now.getTime() + 2 * 86400000);

      const mockTasks = [
        {
          id: 'task-1',
          title: 'Overdue Task',
          status: 'todo',
          dueDate: yesterday,
          completedAt: null,
        },
        {
          id: 'task-2',
          title: 'Due Soon Task',
          status: 'todo',
          dueDate: twoDaysLater,
          completedAt: null,
        },
        {
          id: 'task-3',
          title: 'Completed On Time',
          status: 'done',
          dueDate: tomorrow,
          completedAt: yesterday,
        },
        {
          id: 'task-4',
          title: 'Completed Late',
          status: 'done',
          dueDate: yesterday,
          completedAt: now,
        },
      ];

      const mockQueryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockTasks),
      };

      mockProjectRepo.findOne.mockResolvedValue(mockProject);
      mockTaskRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getDeadlineAnalytics(projectId);

      expect(result.overdueTasks).toBeGreaterThanOrEqual(1);
      expect(result.dueSoonTasks).toBeGreaterThanOrEqual(1);
      expect(result.overdueTasksList).toBeDefined();
      expect(result.dueSoonTasksList).toBeDefined();
      expect(result.completedOnTimeList).toBeDefined();
      expect(result.completedLateList).toBeDefined();
    });

    it('should throw NotFoundException if project not found', async () => {
      mockProjectRepo.findOne.mockResolvedValue(null);

      await expect(service.getDeadlineAnalytics(projectId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});

