import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
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

@ApiTags('Project Members')
@Controller('project-members')
export class ProjectMembersController {
  constructor(private readonly projectMembersService: ProjectMembersService) {}

  // 🟢 Lấy danh sách thành viên trong dự án
  @Get(':projectId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Lấy danh sách thành viên trong dự án' })
  @ApiResponse({ status: 200, description: 'Danh sách thành viên được lấy thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy dự án' })
  async getMembers(@Param('projectId') projectId: string) {
    return await this.projectMembersService.getMembers(projectId);
  }

  @Post(':projectId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Thêm thành viên vào dự án' })
  @ApiResponse({ status: 201, description: 'Thành viên được thêm thành công' })
  @ApiResponse({ status: 403, description: 'Chỉ leader hoặc manager mới có quyền thêm thành viên' })
  async addMember(
    @Param('projectId') projectId: string,
    @Body() dto: CreateProjectMemberDto,
    @Request() req: any,
  ) {
    return await this.projectMembersService.addMember(projectId, dto, req.user.sub as string);
  }

  @Patch(':projectId/:memberId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Cập nhật vai trò của thành viên trong dự án' })
  @ApiResponse({ status: 200, description: 'Cập nhật vai trò thành công' })
  @ApiResponse({ status: 403, description: 'Chỉ leader mới có quyền thay đổi vai trò' })
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

  // 🟢 Xóa thành viên khỏi dự án
  @Delete(':projectId/:memberId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Xóa thành viên khỏi dự án' })
  @ApiResponse({ status: 200, description: 'Thành viên đã bị xóa khỏi dự án' })
  @ApiResponse({ status: 403, description: 'Chỉ leader mới có quyền xóa thành viên' })
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

  // 🟢 Chuyển quyền leader cho thành viên khác
  @Put(':projectId/transfer-leader/:newLeaderId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Chuyển quyền leader cho thành viên khác' })
  @ApiResponse({ status: 200, description: 'Chuyển quyền leader thành công' })
  @ApiResponse({ status: 403, description: 'Chỉ leader hiện tại mới có quyền chuyển quyền' })
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
