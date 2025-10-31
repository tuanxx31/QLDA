import { Module } from '@nestjs/common';
import { SubTasksService } from './sub-tasks.service';
import { SubTasksController } from './sub-tasks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubTask } from './entities/sub-task.entity';
import { Task } from 'src/tasks/entities/task.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SubTask, Task])],
  controllers: [SubTasksController],
  providers: [SubTasksService],
})
export class SubTasksModule {}
