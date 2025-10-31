import { Module } from '@nestjs/common';
import { SubTasksService } from './sub-tasks.service';
import { SubTasksController } from './sub-tasks.controller';

@Module({
  controllers: [SubTasksController],
  providers: [SubTasksService],
})
export class SubTasksModule {}
