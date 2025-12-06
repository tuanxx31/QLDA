import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import {
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

import * as bcrypt from 'bcrypt';

describe('UsersService', () => {
  let service: UsersService;
  let userRepo: Repository<User>;

  const mockUserRepo = {
    findOneBy: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepo,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepo = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  describe('updatePassword', () => {
    const userId = 'user-1';
    const updatePasswordDto: UpdatePasswordDto = {
      password: 'oldPassword',
      newPassword: 'newPassword123',
    };

    it('should update password successfully', async () => {
      const mockUser = {
        id: userId,
        password: 'hashedOldPassword',
      };

      mockUserRepo.findOneBy.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedNewPassword' as never);
      mockUserRepo.update.mockResolvedValue({ affected: 1 } as any);

      const result = await service.updatePassword(userId, updatePasswordDto);

      expect(result.message).toBe('Mật khẩu đã được cập nhật thành công');
      expect(bcrypt.compare).toHaveBeenCalledWith(
        updatePasswordDto.password,
        mockUser.password,
      );
      expect(bcrypt.hash).toHaveBeenCalledWith(
        updatePasswordDto.newPassword,
        10,
      );
      expect(mockUserRepo.update).toHaveBeenCalledWith(userId, {
        password: 'hashedNewPassword',
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepo.findOneBy.mockResolvedValue(null);

      await expect(
        service.updatePassword(userId, updatePasswordDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if old password is incorrect', async () => {
      const mockUser = {
        id: userId,
        password: 'hashedOldPassword',
      };

      mockUserRepo.findOneBy.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(
        service.updatePassword(userId, updatePasswordDto),
      ).rejects.toThrow(BadRequestException);
      expect(mockUserRepo.update).not.toHaveBeenCalled();
    });
  });

  describe('updateProfile', () => {
    const userId = 'user-1';
    const updateUserDto: UpdateUserDto = {
      name: 'Updated Name',
      avatar: 'https://example.com/avatar.jpg',
    };

    it('should update profile successfully', async () => {
      mockUserRepo.update.mockResolvedValue({ affected: 1 } as any);

      const result = await service.updateProfile(userId, updateUserDto);

      expect(result.message).toBe(
        'Thông tin profile đã được cập nhật thành công',
      );
      expect(mockUserRepo.update).toHaveBeenCalledWith(userId, updateUserDto);
    });

    it('should throw BadRequestException if update fails', async () => {
      mockUserRepo.update.mockResolvedValue({ affected: 0 } as any);

      await expect(
        service.updateProfile(userId, updateUserDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getProfile', () => {
    const userId = 'user-1';

    it('should return user profile', async () => {
      const mockUser = {
        id: userId,
        name: 'Test User',
        email: 'test@example.com',
        avatar: 'https://example.com/avatar.jpg',
      };

      mockUserRepo.findOneBy.mockResolvedValue(mockUser);

      const result = await service.getProfile(userId);

      expect(result).toBeDefined();
      expect(mockUserRepo.findOneBy).toHaveBeenCalledWith({ id: userId });
    });

    it('should return null if user not found', async () => {
      mockUserRepo.findOneBy.mockResolvedValue(null);

      const result = await service.getProfile(userId);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword',
      };
      const mockUser = {
        id: 'user-1',
        ...userData,
      };

      mockUserRepo.create.mockReturnValue(mockUser);
      mockUserRepo.save.mockResolvedValue(mockUser);

      const result = await service.create(userData);

      expect(result).toEqual(mockUser);
      expect(mockUserRepo.create).toHaveBeenCalledWith(userData);
      expect(mockUserRepo.save).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const mockUsers = [
        { id: 'user-1', name: 'User 1' },
        { id: 'user-2', name: 'User 2' },
      ];

      mockUserRepo.find.mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(result).toEqual(mockUsers);
      expect(mockUserRepo.find).toHaveBeenCalled();
    });
  });

  describe('findOneByEmail', () => {
    it('should return user by email', async () => {
      const email = 'test@example.com';
      const mockUser = {
        id: 'user-1',
        email,
        name: 'Test User',
      };

      mockUserRepo.findOne.mockResolvedValue(mockUser);

      const result = await service.findOneByEmail(email);

      expect(result).toEqual(mockUser);
      expect(mockUserRepo.findOne).toHaveBeenCalledWith({ where: { email } });
    });

    it('should return null if user not found', async () => {
      const email = 'notfound@example.com';

      mockUserRepo.findOne.mockResolvedValue(null);

      const result = await service.findOneByEmail(email);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    const userId = 'user-1';
    const updateUserDto: UpdateUserDto = {
      name: 'Updated Name',
    };

    it('should update user', async () => {
      const mockUpdatedUser = {
        id: userId,
        ...updateUserDto,
      };

      mockUserRepo.update.mockResolvedValue({ affected: 1 } as any);
      mockUserRepo.findOneBy.mockResolvedValue(mockUpdatedUser);

      const result = await service.update(userId, updateUserDto);

      expect(result).toEqual(mockUpdatedUser);
      expect(mockUserRepo.update).toHaveBeenCalledWith(userId, updateUserDto);
    });
  });

  describe('remove', () => {
    const userId = 'user-1';

    it('should remove user successfully', async () => {
      const mockUser = {
        id: userId,
        name: 'Test User',
      };

      mockUserRepo.findOneBy.mockResolvedValue(mockUser);
      mockUserRepo.delete.mockResolvedValue({ affected: 1 } as any);

      const result = await service.remove(userId);

      expect(result.message).toBe(`User ${userId} delete success`);
      expect(mockUserRepo.delete).toHaveBeenCalledWith({ id: userId });
    });

    it('should return message if user not found', async () => {
      mockUserRepo.findOneBy.mockResolvedValue(null);

      const result = await service.remove(userId);

      expect(result.message).toBe(`User ${userId} not found`);
      expect(mockUserRepo.delete).not.toHaveBeenCalled();
    });
  });

  describe('updateAvatar', () => {
    const userId = 'user-1';
    const avatarUrl = '/uploads/avatar-1234567890.png';

    it('should update avatar successfully', async () => {
      mockUserRepo.update.mockResolvedValue({ affected: 1 } as any);

      const result = await service.updateAvatar(userId, avatarUrl);

      expect(result.message).toBe('Avatar đã được cập nhật thành công');
      expect(result.avatar).toBe(avatarUrl);
      expect(mockUserRepo.update).toHaveBeenCalledWith(userId, {
        avatar: avatarUrl,
      });
    });

    it('should throw BadRequestException if update fails', async () => {
      mockUserRepo.update.mockResolvedValue({ affected: 0 } as any);

      await expect(service.updateAvatar(userId, avatarUrl)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
