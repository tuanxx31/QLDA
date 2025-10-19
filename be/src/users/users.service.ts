// users.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserProfileDto } from './dto/user-profile.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getProfile(id: number): Promise<UserProfileDto | null> {
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

  async update(id: number, updateUserDto: UpdateUserDto) {
    await this.userRepository.update(id, updateUserDto);
    return this.userRepository.findOneBy({ id });
  }

  async remove(id: number) {
    const user = await this.userRepository.findOneBy({ id });
    if (user) {
      await this.userRepository.delete({ id });
      return { message: `User ${id} delete success` };
    }
    return { message: `User ${id} not found` };
  }
}
