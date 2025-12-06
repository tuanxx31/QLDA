import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { BadRequestException } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
    updatePassword: jest.fn(),
    remove: jest.fn(),
    updateAvatar: jest.fn(),
  };

  const mockAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const userId = 'user-1';
      const mockProfile = {
        id: userId,
        name: 'Test User',
        email: 'test@example.com',
      };
      const mockReq = {
        user: { sub: userId },
      };

      mockUsersService.getProfile.mockResolvedValue(mockProfile);

      const result = await controller.getProfile(mockReq);

      expect(result).toEqual(mockProfile);
      expect(service.getProfile).toHaveBeenCalledWith(userId);
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const userId = 'user-1';
      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
      };
      const mockReq = {
        user: { sub: userId },
      };
      const mockResult = {
        message: 'Thông tin profile đã được cập nhật thành công',
      };

      mockUsersService.updateProfile.mockResolvedValue(mockResult);

      const result = await controller.updateProfile(mockReq, updateUserDto);

      expect(result).toEqual(mockResult);
      expect(service.updateProfile).toHaveBeenCalledWith(userId, updateUserDto);
    });
  });

  describe('updatePassword', () => {
    it('should update user password', async () => {
      const userId = 'user-1';
      const updatePasswordDto: UpdatePasswordDto = {
        password: 'oldPassword',
        newPassword: 'newPassword123',
      };
      const mockReq = {
        user: { sub: userId },
      };
      const mockResult = {
        message: 'Mật khẩu đã được cập nhật thành công',
      };

      mockUsersService.updatePassword.mockResolvedValue(mockResult);

      const result = await controller.updatePassword(mockReq, updatePasswordDto);

      expect(result).toEqual(mockResult);
      expect(service.updatePassword).toHaveBeenCalledWith(
        userId,
        updatePasswordDto,
      );
    });
  });

  describe('deleteUser', () => {
    it('should delete user', async () => {
      const userId = 'user-1';
      const mockReq = {
        user: { sub: userId },
      };
      const mockResult = {
        message: `User ${userId} delete success`,
      };

      mockUsersService.remove.mockResolvedValue(mockResult);

      const result = await controller.deleteUser(mockReq);

      expect(result).toEqual(mockResult);
      expect(service.remove).toHaveBeenCalledWith(userId);
    });
  });

  describe('uploadAvatar', () => {
    it('should upload avatar successfully', async () => {
      const userId = 'user-1';
      const mockFile = {
        filename: 'avatar-1234567890.png',
        originalname: 'avatar.png',
        size: 1024,
      } as Express.Multer.File;
      const mockReq = {
        user: { sub: userId },
      };
      const mockResult = {
        message: 'Avatar đã được cập nhật thành công',
        avatar: '/uploads/avatar-1234567890.png',
      };

      mockUsersService.updateAvatar.mockResolvedValue(mockResult);

      const result = await controller.uploadAvatar(mockReq, mockFile);

      expect(result).toEqual(mockResult);
      expect(service.updateAvatar).toHaveBeenCalledWith(
        userId,
        '/uploads/avatar-1234567890.png',
      );
    });
  });
});
