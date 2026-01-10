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
  ForbiddenException,
  Query,
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AssignUsersDto, AssignLabelsDto, UnassignUsersDto } from './dto/assign.dto';
import { TaskService } from './tasks.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Tasks')
@Controller('tasks')
@UseGuards(AuthGuard)
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get('schedule/my')
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Lấy lịch làm việc của user hiện tại' })
  @ApiQuery({ name: 'startDate', required: true, type: String, description: 'Ngày bắt đầu (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: true, type: String, description: 'Ngày kết thúc (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Lịch làm việc đã được lấy thành công' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getMySchedule(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Req() req,
  ) {
    const userId = req.user?.sub as string;
    if (!userId) {
      throw new ForbiddenException('Không xác định được người dùng');
    }
    
    
    const endDateObj = new Date(endDate);
    endDateObj.setHours(23, 59, 59, 999);
    
    return this.taskService.getMySchedule(
      userId,
      new Date(startDate),
      endDateObj,
    );
  }

  @Get(':id')
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Lấy thông tin task theo ID' })
  @ApiResponse({ status: 200, description: 'Task đã được lấy thành công' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập dự án' })
  findOne(@Param('id') id: string, @Req() req) {
    const userId = req.user?.sub as string;
    if (!userId) {
      throw new ForbiddenException('Không xác định được người dùng');
    }
    return this.taskService.findOne(id, userId);
  }

  @Get(':id/assignees')
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Lấy danh sách assignees của task' })
  @ApiResponse({ status: 200, description: 'Danh sách assignees đã được lấy thành công' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập dự án' })
  getAssignees(@Param('id') id: string, @Req() req) {
    const userId = req.user?.sub as string;
    if (!userId) {
      throw new ForbiddenException('Không xác định được người dùng');
    }
    return this.taskService.getAssignees(id, userId);
  }

  @Patch(':id/status')
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Cập nhật trạng thái task' })
  @ApiResponse({ status: 200, description: 'Trạng thái task đã được cập nhật thành công' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Không có quyền cập nhật trạng thái' })
  updateStatus(@Param('id') id: string, @Body() body: { status: 'todo'| 'done' }, @Req() req) {
    const userId = req.user?.sub ?? null;
    return this.taskService.updateStatus(id, body.status, userId);
  }
  @Get('column/:columnId')
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Lấy danh sách task theo cột' })
  @ApiResponse({ status: 200, description: 'Danh sách task đã được lấy thành công' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập dự án' })
  findByColumn(@Param('columnId') columnId: string, @Req() req) {
    const userId = req.user?.sub as string;
    if (!userId) {
      throw new ForbiddenException('Không xác định được người dùng');
    }
    return this.taskService.findByColumn(columnId, userId);
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
  @ApiResponse({ status: 403, description: 'Không có quyền cập nhật task' })
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto, @Req() req) {
    const userId = req.user?.sub ?? null;
    return this.taskService.update(id, dto, userId);
  }

  @Delete(':id')
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Xóa task' })
  @ApiResponse({ status: 200, description: 'Task đã được xóa thành công' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Không có quyền xóa task' })
  remove(@Param('id') id: string, @Req() req) {
    const userId = req.user?.sub ?? null;
    return this.taskService.remove(id, userId);
  }

  @Patch(':id/assignees')
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Gán người làm task' })
  @ApiResponse({ status: 200, description: 'Task đã được gán người làm thành công' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Không có quyền gán người làm task' })
  assignUsers(@Param('id') id: string, @Body() dto: AssignUsersDto, @Req() req) {
    const userId = req.user?.sub ?? null;
    return this.taskService.assignUsers(id, dto, userId);
  }

  @Delete(':id/assignees')
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Hủy gán người làm task' })
  @ApiResponse({ status: 200, description: 'Task đã được hủy gán người làm thành công' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Không có quyền hủy gán người làm task' })
  unassignUsers(@Param('id') id: string, @Body() dto: UnassignUsersDto, @Req() req) {
    const userId = req.user?.sub ?? null;
    return this.taskService.unassignUsers(id, dto, userId);
  }

  @Patch(':id/labels')
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Gán nhãn task' })
  @ApiResponse({ status: 200, description: 'Task đã được gán nhãn thành công' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Không có quyền gán nhãn task' })
  assignLabels(@Param('id') id: string, @Body() dto: AssignLabelsDto, @Req() req) {
    const userId = req.user?.sub ?? null;
    return this.taskService.assignLabels(id, dto, userId);
  }

  @Delete(':id/labels')
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Bỏ gán nhãn task' })
  @ApiResponse({ status: 200, description: 'Task đã được bỏ gán nhãn thành công' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Không có quyền bỏ gán nhãn task' })
  unassignLabels(@Param('id') id: string, @Body() dto: AssignLabelsDto, @Req() req) {
    const userId = req.user?.sub ?? null;
    return this.taskService.unassignLabels(id, dto, userId);
  }

  @Patch(':id/position')
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Cập nhật vị trí task' })
  @ApiResponse({ status: 200, description: 'Task đã được cập nhật vị trí thành công' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập dự án' })
  updatePosition(@Param('id') id: string, @Body() body: { prevTaskId?: string; nextTaskId?: string; columnId?: string }, @Req() req) {
    const userId = req.user?.sub ?? null;
    return this.taskService.updatePosition(id, userId, body.prevTaskId, body.nextTaskId, body.columnId);
  }

  @Post(':id/subtasks')
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Thêm subtask' })
  @ApiResponse({ status: 201, description: 'Subtask đã được thêm thành công' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập dự án' })
  addSubTask(@Param('id') taskId: string, @Body('title') title: string, @Req() req) {
    const userId = req.user?.sub ?? null;
    return this.taskService.addSubTask(taskId, title, userId);
  }

  @Patch('subtasks/:id')
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Cập nhật subtask' })
  @ApiResponse({ status: 200, description: 'Subtask đã được cập nhật thành công' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập dự án' })
  updateSubTask(@Param('id') id: string, @Body() update: { title?: string; completed?: boolean }, @Req() req) {
    const userId = req.user?.sub ?? null;
    return this.taskService.updateSubTask(id, update, userId);
  }
}
