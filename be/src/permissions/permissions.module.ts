import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionsService } from './permissions.service';
import { ProjectMember } from 'src/project-members/entities/project-member.entity';
import { GroupMember } from 'src/group-member/entities/group-member.entity';
import { Project } from 'src/projects/entities/project.entity';
import { Group } from 'src/groups/entities/group.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProjectMember,
      GroupMember,
      Project,
      Group,
    ]),
  ],
  providers: [PermissionsService],
  exports: [PermissionsService],
})
export class PermissionsModule {}

