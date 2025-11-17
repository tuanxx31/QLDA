import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AssignUsersDto, AssignLabelsDto } from './dto/assign.dto';
import { TaskService } from './tasks.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Tasks')
@Controller('tasks')
@UseGuards(AuthGuard)
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get(':id')
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Lấy thông tin task theo ID' })
  @ApiResponse({ status: 200, description: 'Task đã được lấy thành công' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id') id: string) {
    return this.taskService.findOne(id);
  }

  @Get(':id/assignees')
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Lấy danh sách assignees của task' })
  @ApiResponse({ status: 200, description: 'Danh sách assignees đã được lấy thành công' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getAssignees(@Param('id') id: string) {
    return this.taskService.getAssignees(id);
  }

  @Patch(':id/status')
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Cập nhật trạng thái task' })
  @ApiResponse({ status: 200, description: 'Trạng thái task đã được cập nhật thành công' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  updateStatus(@Param('id') id: string, @Body() body: { status: 'todo'| 'done' }) {
    return this.taskService.updateStatus(id, body.status);
  }
  @Get('column/:columnId')
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Lấy danh sách task theo cột' })
  @ApiResponse({ status: 200, description: 'Danh sách task đã được lấy thành công' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findByColumn(@Param('columnId') columnId: string) {
    return this.taskService.findByColumn(columnId);
  }

  @Post()
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Tạo task mới' })
  @ApiResponse({ status: 201, description: 'Task đã được tạo thành công' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() dto: CreateTaskDto, @Req() req) {
    const creatorId = req.user?.sub ?? null;
    return this.taskService.create(dto, creatorId);
  }

  @Patch(':id')
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Cập nhật task' })
  @ApiResponse({ status: 200, description: 'Task đã được cập nhật thành công' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.taskService.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Xóa task' })
  @ApiResponse({ status: 200, description: 'Task đã được xóa thành công' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  remove(@Param('id') id: string) {
    return this.taskService.remove(id);
  }

  @Patch(':id/assignees')
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Gán người làm task' })
  @ApiResponse({ status: 200, description: 'Task đã được gán người làm thành công' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  assignUsers(@Param('id') id: string, @Body() dto: AssignUsersDto) {
    return this.taskService.assignUsers(id, dto);
  }

  @Patch(':id/labels')
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Gán nhãn task' })
  @ApiResponse({ status: 200, description: 'Task đã được gán nhãn thành công' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  assignLabels(@Param('id') id: string, @Body() dto: AssignLabelsDto) {
    return this.taskService.assignLabels(id, dto);
  }

  @Delete(':id/labels')
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Bỏ gán nhãn task' })
  @ApiResponse({ status: 200, description: 'Task đã được bỏ gán nhãn thành công' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  unassignLabels(@Param('id') id: string, @Body() dto: AssignLabelsDto) {
    return this.taskService.unassignLabels(id, dto);
  }

  @Patch(':id/position')
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Cập nhật vị trí task' })
  @ApiResponse({ status: 200, description: 'Task đã được cập nhật vị trí thành công' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  updatePosition(@Param('id') id: string, @Body() body: { prevTaskId?: string; nextTaskId?: string; columnId?: string }) {
    return this.taskService.updatePosition(id, body.prevTaskId, body.nextTaskId, body.columnId);
  }

  @Post(':id/subtasks')
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Thêm subtask' })
  @ApiResponse({ status: 201, description: 'Subtask đã được thêm thành công' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  addSubTask(@Param('id') taskId: string, @Body('title') title: string) {
    return this.taskService.addSubTask(taskId, title);
  }

  @Patch('subtasks/:id')
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Cập nhật subtask' })
  @ApiResponse({ status: 200, description: 'Subtask đã được cập nhật thành công' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  updateSubTask(@Param('id') id: string, @Body() update: { title?: string; completed?: boolean }) {
    return this.taskService.updateSubTask(id, update);
  }
}
