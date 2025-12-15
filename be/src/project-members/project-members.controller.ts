import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { ProjectMembersService } from './project-members.service';
import { CreateProjectMemberDto } from './dto/create-project-member.dto';
import { UpdateProjectMemberDto } from './dto/update-project-member.dto';
import { AddProjectMembersDto } from './dto/add-project-members.dto';
import { TaskService } from 'src/tasks/tasks.service';
import { ProjectRoleGuard } from 'src/permissions/guards/project-role.guard';
import { RequireProjectRole } from 'src/permissions/decorators/require-project-role.decorator';

@ApiTags('Project Members')
@Controller('project-members')
export class ProjectMembersController {
  constructor(private readonly projectMembersService: ProjectMembersService , private readonly taskService: TaskService) {}

  @Get(':projectId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Lấy danh sách thành viên trong dự án' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách thành viên được lấy thành công',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy dự án' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập dự án' })
  async getMembers(@Param('projectId') projectId: string, @Request() req: any, @Query('taskId') taskId?: string) {
    const userId = req.user.sub as string;

    let membersIdExcludeTask: string[] = [];
    if (taskId) {
      const taskAssignees = await this.taskService.getAssignees(taskId, userId);
      membersIdExcludeTask = taskAssignees.map((assignee) => assignee.id);
    }

    return await this.projectMembersService.getMembers(projectId, userId, membersIdExcludeTask);
  }

  @Post(':projectId')
  @UseGuards(AuthGuard, ProjectRoleGuard)
  @RequireProjectRole('leader')
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Thêm thành viên vào dự án' })
  @ApiResponse({ status: 201, description: 'Thành viên được thêm thành công' })
  @ApiResponse({
    status: 403,
    description: 'Chỉ leader mới có quyền thêm thành viên',
  })
  async addMember(
    @Param('projectId') projectId: string,
    @Body() dto: CreateProjectMemberDto,
    @Request() req: any,
  ) {
    return await this.projectMembersService.addMember(
      projectId,
      dto,
      req.user.sub as string,
    );
  }

  @Post(':projectId/add-members')
  @UseGuards(AuthGuard, ProjectRoleGuard)
  @RequireProjectRole('leader')
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Thêm nhiều thành viên vào dự án' })
  @ApiResponse({ status: 201, description: 'Thành viên được thêm thành công' })
  @ApiResponse({
    status: 403,
    description: 'Chỉ leader mới có quyền thêm thành viên',
  })
  async addMembers(
    @Param('projectId') projectId: string,
    @Body() dto: AddProjectMembersDto,
  ) {
    return await this.projectMembersService.addMembers(projectId, dto);
  }

  @Patch(':projectId/:memberId')
  @UseGuards(AuthGuard, ProjectRoleGuard)
  @RequireProjectRole('leader')
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Cập nhật vai trò của thành viên trong dự án' })
  @ApiResponse({ status: 200, description: 'Cập nhật vai trò thành công' })
  @ApiResponse({
    status: 403,
    description: 'Chỉ leader mới có quyền thay đổi vai trò',
  })
  async updateMemberRole(
    @Param('projectId') projectId: string,
    @Param('memberId') memberId: string,
    @Body() dto: UpdateProjectMemberDto,
    @Request() req: any,
  ) {
    return await this.projectMembersService.updateMemberRole(
      projectId,
      memberId,
      dto,
      req.user.sub as string,
    );
  }

  @Delete(':projectId/:memberId')
  @UseGuards(AuthGuard, ProjectRoleGuard)
  @RequireProjectRole('leader')
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Xóa thành viên khỏi dự án' })
  @ApiResponse({ status: 200, description: 'Thành viên đã bị xóa khỏi dự án' })
  @ApiResponse({
    status: 403,
    description: 'Chỉ leader mới có quyền xóa thành viên',
  })
  async removeMember(
    @Param('projectId') projectId: string,
    @Param('memberId') memberId: string,
    @Request() req: any,
  ) {
    return await this.projectMembersService.removeMember(
      projectId,
      memberId,
      req.user.sub as string,
    );
  }

  @Put(':projectId/transfer-leader/:newLeaderId')
  @UseGuards(AuthGuard, ProjectRoleGuard)
  @RequireProjectRole('leader')
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Chuyển quyền leader cho thành viên khác' })
  @ApiResponse({ status: 200, description: 'Chuyển quyền leader thành công' })
  @ApiResponse({
    status: 403,
    description: 'Chỉ leader hiện tại mới có quyền chuyển quyền',
  })
  async transferLeader(
    @Param('projectId') projectId: string,
    @Param('newLeaderId') newLeaderId: string,
    @Request() req: any,
  ) {
    return await this.projectMembersService.transferLeader(
      projectId,
      newLeaderId,
      req.user.sub as string,
    );
  }
}
