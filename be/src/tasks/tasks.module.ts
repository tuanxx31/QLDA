import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { Label } from 'src/labels/entities/label.entity';
import { User } from 'src/users/entities/user.entity';
import { SubTask } from 'src/sub-tasks/entities/sub-task.entity';
import { TaskService } from './tasks.service';
import { TaskController } from './tasks.controller';
import { ColumnEntity } from 'src/columns/entities/column.entity';
import { PermissionsModule } from 'src/permissions/permissions.module';
import { ProjectMember } from 'src/project-members/entities/project-member.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, SubTask, Label, User, ColumnEntity, ProjectMember]),
    PermissionsModule,
  ],
  controllers: [TaskController],
  providers: [TaskService],
  exports: [TaskService],
})
export class TaskModule {}
