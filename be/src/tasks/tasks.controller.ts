import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('columns/:columnId/tasks')
@UseGuards(AuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Tạo task mới' })
  @ApiResponse({ status: 201, description: 'Task đã được tạo thành công' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Param('columnId') columnId: string, @Body() dto: CreateTaskDto) {
    return this.tasksService.create(columnId, dto);
  }

  @Get()
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Lấy tất cả task của cột' })
  @ApiResponse({ status: 200, description: 'Task đã được lấy thành công' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@Param('columnId') columnId: string) {
    return this.tasksService.findAll(columnId);
  }

  @Patch(':id')
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Cập nhật task' })
  @ApiResponse({ status: 200, description: 'Task đã được cập nhật thành công' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.tasksService.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Xóa task' })
  @ApiResponse({ status: 200, description: 'Task đã được xóa thành công' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }
}
