import { forwardRef, Module } from '@nestjs/common';
import { GroupMemberService } from './group-member.service';
import { GroupMemberController } from './group-member.controller';
import { UsersModule } from 'src/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupMember } from './entities/group-member.entity';
import { Group } from 'src/groups/entities/group.entity';
import { GroupsModule } from 'src/groups/groups.module';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([GroupMember, Group, User]),
    forwardRef(() => GroupsModule),
    forwardRef(() => UsersModule),
  ],
  controllers: [GroupMemberController],
  providers: [GroupMemberService],
})
export class GroupMemberModule {}
