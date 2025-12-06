import { Test, TestingModule } from '@nestjs/testing';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { BadRequestException } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';

describe('CommentsController', () => {
  let controller: CommentsController;
  let service: CommentsService;

  const mockCommentsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [
        {
          provide: CommentsService,
          useValue: mockCommentsService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    controller = module.get<CommentsController>(CommentsController);
    service = module.get<CommentsService>(CommentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated comments', async () => {
      const taskId = 'task-1';
      const page = '1';
      const limit = '20';
      const mockResult = {
        data: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      };

      mockCommentsService.findAll.mockResolvedValue(mockResult);

      const result = await controller.findAll(taskId, page, limit);

      expect(result).toEqual(mockResult);
      expect(service.findAll).toHaveBeenCalledWith(taskId, 1, 20);
    });

    it('should use default pagination values', async () => {
      const taskId = 'task-1';
      const mockResult = {
        data: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      };

      mockCommentsService.findAll.mockResolvedValue(mockResult);

      const result = await controller.findAll(taskId);

      expect(result).toEqual(mockResult);
      expect(service.findAll).toHaveBeenCalledWith(taskId, 1, 20);
    });
  });

  describe('create', () => {
    it('should create a comment', async () => {
      const taskId = 'task-1';
      const userId = 'user-1';
      const createDto: CreateCommentDto = {
        content: 'Test comment',
      };
      const mockComment = {
        id: 'comment-1',
        ...createDto,
        userId,
        taskId,
      };
      const mockReq = {
        user: { sub: userId },
      };

      mockCommentsService.create.mockResolvedValue(mockComment);

      const result = await controller.create(taskId, createDto, mockReq);

      expect(result).toEqual(mockComment);
      expect(service.create).toHaveBeenCalledWith(taskId, userId, createDto);
    });

    it('should handle null user', async () => {
      const taskId = 'task-1';
      const createDto: CreateCommentDto = {
        content: 'Test comment',
      };
      const mockReq = {
        user: null,
      };

      mockCommentsService.create.mockResolvedValue({});

      await controller.create(taskId, createDto, mockReq);

      expect(service.create).toHaveBeenCalledWith(taskId, null, createDto);
    });
  });

  describe('update', () => {
    it('should update a comment', async () => {
      const taskId = 'task-1';
      const commentId = 'comment-1';
      const userId = 'user-1';
      const updateDto: UpdateCommentDto = {
        content: 'Updated content',
      };
      const mockComment = {
        id: commentId,
        ...updateDto,
      };
      const mockReq = {
        user: { sub: userId },
      };

      mockCommentsService.update.mockResolvedValue(mockComment);

      const result = await controller.update(taskId, commentId, updateDto, mockReq);

      expect(result).toEqual(mockComment);
      expect(service.update).toHaveBeenCalledWith(commentId, userId, updateDto);
    });
  });

  describe('remove', () => {
    it('should remove a comment', async () => {
      const taskId = 'task-1';
      const commentId = 'comment-1';
      const userId = 'user-1';
      const mockReq = {
        user: { sub: userId },
      };
      const mockResult = {
        message: 'Đã xóa comment thành công',
      };

      mockCommentsService.remove.mockResolvedValue(mockResult);

      const result = await controller.remove(taskId, commentId, mockReq);

      expect(result).toEqual(mockResult);
      expect(service.remove).toHaveBeenCalledWith(commentId, userId);
    });
  });

  describe('uploadFile', () => {
    it('should upload file successfully', async () => {
      const taskId = 'task-1';
      const mockFile = {
        filename: 'comment-1234567890.png',
        originalname: 'test.png',
        size: 1024,
      } as Express.Multer.File;

      const result = await controller.uploadFile(taskId, mockFile);

      expect(result.fileUrl).toBe(`/uploads/${mockFile.filename}`);
      expect(result.filename).toBe(mockFile.originalname);
      expect(result.size).toBe(mockFile.size);
    });

    it('should throw BadRequestException if file is missing', async () => {
      const taskId = 'task-1';
      const mockFile = null as unknown as Express.Multer.File;

      await expect(controller.uploadFile(taskId, mockFile)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});

