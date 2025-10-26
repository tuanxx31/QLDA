// users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { Group } from 'src/groups/entities/group.entity';
import { GroupMember } from 'src/group-member/entities/group-member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Group, GroupMember, User])],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService], 
})
export class UsersModule {}
