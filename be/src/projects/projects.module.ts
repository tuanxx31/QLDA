import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { User } from 'src/users/entities/user.entity';
import { Group } from 'src/groups/entities/group.entity';
import { ProjectMember } from 'src/project-members/entities/project-member.entity';

@Module({
  controllers: [ProjectsController],
  providers: [ProjectsService],
  imports: [TypeOrmModule.forFeature([Project, User, Group, ProjectMember])],
})
export class ProjectsModule {}
