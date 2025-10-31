import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { SubTasksService } from './sub-tasks.service';
import { CreateSubTaskDto } from './dto/create-sub-task.dto';
import { UpdateSubTaskDto } from './dto/update-sub-task.dto';

@Controller('tasks/:taskId/subtasks')
export class SubTasksController {
  constructor(private readonly subtasksService: SubTasksService) {}

  @Post()
  create(@Param('taskId') taskId: string, @Body() dto: CreateSubTaskDto) {
    return this.subtasksService.create(taskId, dto);
  }

  @Get()
  findAll(@Param('taskId') taskId: string) {
    return this.subtasksService.findAll(taskId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSubTaskDto) {
    return this.subtasksService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subtasksService.remove(id);
  }
}
