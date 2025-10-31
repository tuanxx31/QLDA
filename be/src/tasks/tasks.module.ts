import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { ColumnEntity } from 'src/columns/entities/column.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Task, ColumnEntity])],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
