import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CommentsService } from './comments.service';
import { Comment } from './entities/comment.entity';
import { Task } from 'src/tasks/entities/task.entity';
import { User } from 'src/users/entities/user.entity';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

describe('CommentsService', () => {
  let service: CommentsService;
  let commentRepo: Repository<Comment>;
  let taskRepo: Repository<Task>;
  let userRepo: Repository<User>;

  const mockCommentRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockTaskRepo = {
    findOne: jest.fn(),
  };

  const mockUserRepo = {
    findOne: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: getRepositoryToken(Comment),
          useValue: mockCommentRepo,
        },
        {
          provide: getRepositoryToken(Task),
          useValue: mockTaskRepo,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepo,
        },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
    commentRepo = module.get<Repository<Comment>>(getRepositoryToken(Comment));
    taskRepo = module.get<Repository<Task>>(getRepositoryToken(Task));
    userRepo = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const taskId = 'task-1';
    const userId = 'user-1';
    const createDto: CreateCommentDto = {
      content: 'Test comment',
      fileUrl: null,
      mentionIds: [],
    };

    it('should create a comment successfully', async () => {
      const mockTask = {
        id: taskId,
        column: { project: { owner: { id: 'owner-1' } } },
      };
      const mockUser = { id: userId, email: 'test@example.com' };
      const mockComment = {
        id: 'comment-1',
        content: createDto.content,
        userId,
        taskId,
        fileUrl: null,
        mentions: [],
        user: mockUser,
      };

      mockTaskRepo.findOne.mockResolvedValue(mockTask);
      mockUserRepo.findOne.mockResolvedValue(mockUser);
      mockCommentRepo.create.mockReturnValue(mockComment);
      mockCommentRepo.save.mockResolvedValue(mockComment);
      mockCommentRepo.findOne.mockResolvedValue({
        ...mockComment,
        user: mockUser,
        mentions: [],
      });

      const result = await service.create(taskId, userId, createDto);

      expect(result).toBeDefined();
      expect(result.content).toBe(createDto.content);
      expect(mockTaskRepo.findOne).toHaveBeenCalledWith({
        where: { id: taskId },
        relations: ['column', 'column.project', 'column.project.owner'],
      });
      expect(mockUserRepo.findOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(mockCommentRepo.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if task not found', async () => {
      mockTaskRepo.findOne.mockResolvedValue(null);

      await expect(service.create(taskId, userId, createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      const mockTask = { id: taskId };
      mockTaskRepo.findOne.mockResolvedValue(mockTask);
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(service.create(taskId, userId, createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should create comment with mentions', async () => {
      const mentionIds = ['user-2', 'user-3'];
      const createDtoWithMentions: CreateCommentDto = {
        ...createDto,
        mentionIds,
      };
      const mockTask = {
        id: taskId,
        column: { project: { owner: { id: 'owner-1' } } },
      };
      const mockUser = { id: userId };
      const mentionUsers = [
        { id: 'user-2', name: 'User 2' },
        { id: 'user-3', name: 'User 3' },
      ];
      const mockComment = {
        id: 'comment-1',
        content: createDto.content,
        userId,
        taskId,
        mentions: mentionUsers,
      };

      mockTaskRepo.findOne.mockResolvedValue(mockTask);
      mockUserRepo.findOne.mockResolvedValue(mockUser);
      mockUserRepo.find.mockResolvedValue(mentionUsers);
      mockCommentRepo.create.mockReturnValue(mockComment);
      mockCommentRepo.save.mockResolvedValue(mockComment);
      mockCommentRepo.findOne.mockResolvedValue({
        ...mockComment,
        user: mockUser,
        mentions: mentionUsers,
      });

      jest.spyOn(service, 'sendMentionNotification').mockImplementation();

      const result = await service.create(taskId, userId, createDtoWithMentions);

      expect(result).toBeDefined();
      expect(mockUserRepo.find).toHaveBeenCalledWith({
        where: { id: In(mentionIds) },
      });
      expect(service.sendMentionNotification).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    const taskId = 'task-1';
    const page = 1;
    const limit = 20;

    it('should return paginated comments', async () => {
      const mockComments = [
        {
          id: 'comment-1',
          content: 'Comment 1',
          user: { id: 'user-1' },
          mentions: [],
        },
        {
          id: 'comment-2',
          content: 'Comment 2',
          user: { id: 'user-2' },
          mentions: [],
        },
      ];
      const total = 2;

      mockCommentRepo.findAndCount.mockResolvedValue([mockComments, total]);

      const result = await service.findAll(taskId, page, limit);

      expect(result.data).toEqual(mockComments);
      expect(result.total).toBe(total);
      expect(result.page).toBe(page);
      expect(result.limit).toBe(limit);
      expect(result.totalPages).toBe(1);
      expect(mockCommentRepo.findAndCount).toHaveBeenCalledWith({
        where: { taskId },
        relations: ['user', 'mentions'],
        order: { createdAt: 'ASC' },
        skip: 0,
        take: limit,
      });
    });

    it('should use default pagination values', async () => {
      mockCommentRepo.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll(taskId);

      expect(mockCommentRepo.findAndCount).toHaveBeenCalledWith({
        where: { taskId },
        relations: ['user', 'mentions'],
        order: { createdAt: 'ASC' },
        skip: 0,
        take: 20,
      });
    });
  });

  describe('findOne', () => {
    const commentId = 'comment-1';

    it('should return a comment', async () => {
      const mockComment = {
        id: commentId,
        content: 'Test comment',
        user: { id: 'user-1' },
        mentions: [],
        task: { id: 'task-1' },
      };

      mockCommentRepo.findOne.mockResolvedValue(mockComment);

      const result = await service.findOne(commentId);

      expect(result).toEqual(mockComment);
      expect(mockCommentRepo.findOne).toHaveBeenCalledWith({
        where: { id: commentId },
        relations: ['user', 'mentions', 'task'],
      });
    });

    it('should throw NotFoundException if comment not found', async () => {
      mockCommentRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(commentId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const commentId = 'comment-1';
    const userId = 'user-1';
    const updateDto: UpdateCommentDto = {
      content: 'Updated content',
    };

    it('should update comment successfully', async () => {
      const mockComment = {
        id: commentId,
        content: 'Old content',
        userId,
        user: { id: userId },
        mentions: [],
      };
      const updatedComment = {
        ...mockComment,
        content: updateDto.content,
      };

      mockCommentRepo.findOne
        .mockResolvedValueOnce(mockComment)
        .mockResolvedValueOnce({
          ...updatedComment,
          user: mockComment.user,
          mentions: [],
        });
      mockCommentRepo.save.mockResolvedValue(updatedComment);

      const result = await service.update(commentId, userId, updateDto);

      expect(result.content).toBe(updateDto.content);
      expect(mockCommentRepo.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if comment not found', async () => {
      mockCommentRepo.findOne.mockResolvedValue(null);

      await expect(service.update(commentId, userId, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user is not the owner', async () => {
      const mockComment = {
        id: commentId,
        userId: 'other-user',
        user: { id: 'other-user' },
      };

      mockCommentRepo.findOne.mockResolvedValue(mockComment);

      await expect(service.update(commentId, userId, updateDto)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should update mentions if provided', async () => {
      const mentionIds = ['user-2'];
      const updateDtoWithMentions: UpdateCommentDto = {
        ...updateDto,
        mentionIds,
      };
      const mockComment = {
        id: commentId,
        userId,
        user: { id: userId },
        mentions: [],
      };
      const mentionUsers = [{ id: 'user-2', name: 'User 2' }];

      mockCommentRepo.findOne
        .mockResolvedValueOnce(mockComment)
        .mockResolvedValueOnce({
          ...mockComment,
          mentions: mentionUsers,
        });
      mockUserRepo.find.mockResolvedValue(mentionUsers);
      mockCommentRepo.save.mockResolvedValue({
        ...mockComment,
        mentions: mentionUsers,
      });

      jest.spyOn(service, 'sendMentionNotification').mockImplementation();

      const result = await service.update(commentId, userId, updateDtoWithMentions);

      expect(result).toBeDefined();
      expect(mockUserRepo.find).toHaveBeenCalledWith({
        where: { id: In(mentionIds) },
      });
      expect(service.sendMentionNotification).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    const commentId = 'comment-1';
    const userId = 'user-1';

    it('should remove comment if user is the owner', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({
          id: commentId,
          userId,
          user: { id: userId },
          task: {
            column: {
              project: {
                owner: { id: 'owner-1' },
              },
            },
          },
        }),
      };

      mockCommentRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockCommentRepo.remove.mockResolvedValue(undefined);

      const result = await service.remove(commentId, userId);

      expect(result.message).toBe('Đã xóa comment thành công');
      expect(mockCommentRepo.remove).toHaveBeenCalled();
    });

    it('should remove comment if user is project owner', async () => {
      const projectOwnerId = 'project-owner-1';
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({
          id: commentId,
          userId: 'other-user',
          user: { id: 'other-user' },
          task: {
            column: {
              project: {
                owner: { id: projectOwnerId },
              },
            },
          },
        }),
      };

      mockCommentRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockCommentRepo.remove.mockResolvedValue(undefined);

      const result = await service.remove(commentId, projectOwnerId);

      expect(result.message).toBe('Đã xóa comment thành công');
    });

    it('should throw NotFoundException if comment not found', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };

      mockCommentRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await expect(service.remove(commentId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user is not owner or project owner', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({
          id: commentId,
          userId: 'other-user',
          user: { id: 'other-user' },
          task: {
            column: {
              project: {
                owner: { id: 'project-owner-1' },
              },
            },
          },
        }),
      };

      mockCommentRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await expect(service.remove(commentId, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('detectMentions', () => {
    it('should detect mentions in content', () => {
      const content = 'Hello @user1 and @user2';
      const result = service.detectMentions(content);

      expect(result).toEqual(['user1', 'user2']);
    });

    it('should return empty array if no mentions', () => {
      const content = 'Hello world';
      const result = service.detectMentions(content);

      expect(result).toEqual([]);
    });
  });

  describe('sendMentionNotification', () => {
    it('should log mention notification', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const mentionedUserIds = ['user-1', 'user-2'];
      const comment = {
        id: 'comment-1',
        content: 'Test',
      } as Comment;

      service.sendMentionNotification(mentionedUserIds, comment);

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});

