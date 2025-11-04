// users.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserProfileDto } from './dto/user-profile.dto';
import { plainToInstance } from 'class-transformer';
import { UpdatePasswordDto } from './dto/update-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async updatePassword(
    id: string,
    dto: UpdatePasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Mật khẩu không đúng');
    }
    const hashedNewPassword = await bcrypt.hash(dto.newPassword, 10);
    await this.userRepository.update(id, { password: hashedNewPassword });
    return { message: 'Mật khẩu đã được cập nhật thành công' };
  }

  async updateProfile(
    id: string,
    dto: UpdateUserDto,
  ): Promise<{ message: string }> {
    console.log({dto});
    const updatedUser = await this.userRepository.update(id, dto);
    if (updatedUser.affected === 0) {
      throw new BadRequestException('Cập nhật thông tin profile thất bại');
    }
    return { message: 'Thông tin profile đã được cập nhật thành công' };
  }

  async getProfile(id: string): Promise<UserProfileDto | null> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) return null;
    return plainToInstance(UserProfileDto, user, {
      excludeExtraneousValues: true,
    });
  }

  create(data: Partial<User>) {
    const newUser = this.userRepository.create(data);
    return this.userRepository.save(newUser);
  }

  findAll() {
    return this.userRepository.find();
  }

  async findOneByEmail(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      return null;
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.userRepository.update(id, updateUserDto);
    return this.userRepository.findOneBy({ id });
  }

  async remove(id: string) {
    const user = await this.userRepository.findOneBy({ id });
    if (user) {
      await this.userRepository.delete({ id });
      return { message: `User ${id} delete success` };
    }
    return { message: `User ${id} not found` };
  }
}
