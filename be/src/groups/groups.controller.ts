import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { JoinGroupDto } from './dto/join-group.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { GroupRoleGuard } from 'src/permissions/guards/group-role.guard';
import { RequireGroupRole } from 'src/permissions/decorators/require-group-role.decorator';
@ApiTags('Groups')
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Tạo nhóm mới' })
  @ApiResponse({ status: 201, description: 'Group created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createGroup(
    @Request() req: any,
    @Body() dto: CreateGroupDto,
  ): Promise<any> {
    return await this.groupsService.create(dto, req.user.sub as string);
  }

  @Get('my')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Lấy danh sách nhóm mà user hiện tại tham gia' })
  @ApiResponse({ status: 200, description: 'Groups retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findMyGroups(@Request() req: any) {
    return await this.groupsService.findAllByUser(req.user.sub as string);
  }

  @Get('pending-invites')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Lấy danh sách lời mời chờ duyệt' })
  @ApiResponse({
    status: 200,
    description: 'Pending invites retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findPendingInvites(@Request() req: any) {
    return await this.groupsService.findPendingInvites(req.user.sub as string);
  }

  @Get('pending-approvals')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Lấy danh sách nhóm đang chờ duyệt' })
  @ApiResponse({
    status: 200,
    description: 'Pending approvals retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findPendingApprovals(@Request() req: any) {
    return await this.groupsService.findPendingApprovals(req.user.sub as string);
  }

  @Post('accept-invite/:groupId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Chấp nhận lời mời thành viên' })
  @ApiResponse({ status: 200, description: 'Invite accepted successfully' })
  @ApiResponse({ status: 404, description: 'Invite not found' })
  async acceptInvite(@Param('groupId') groupId: string, @Request() req: any) {
    return await this.groupsService.acceptInvite(
      groupId,
      req.user.sub as string,
    );
  }

  @Post('reject-invite/:groupId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Từ chối lời mời thành viên' })
  @ApiResponse({ status: 200, description: 'Invite rejected successfully' })
  @ApiResponse({ status: 404, description: 'Invite not found' })
  async rejectInvite(@Param('groupId') groupId: string, @Request() req: any) {
    return await this.groupsService.rejectInvite(
      groupId,
      req.user.sub as string,
    );
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Xem chi tiết nhóm theo ID' })
  @ApiResponse({
    status: 200,
    description: 'Group details retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Group not found' })
  async findOne(@Request() req: any, @Param('id') id: string) {
    return await this.groupsService.findOne(id, req.user.sub as string);
  }

  @Put(':id')
  @UseGuards(AuthGuard, GroupRoleGuard)
  @RequireGroupRole('leader')
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Cập nhật thông tin nhóm (chỉ leader)' })
  @ApiResponse({ status: 200, description: 'Group updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not leader' })
  async updateGroup(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: UpdateGroupDto,
  ) {
    return await this.groupsService.update(id, req.user.sub as string, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, GroupRoleGuard)
  @RequireGroupRole('leader')
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Giải tán nhóm (chỉ leader)' })
  @ApiResponse({ status: 200, description: 'Group deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not leader' })
  async removeGroup(@Param('id') id: string, @Request() req: any) {
    return await this.groupsService.remove(id, req.user.sub as string);
  }

  @Post('join')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Tham gia nhóm bằng mã mời' })
  @ApiResponse({ status: 200, description: 'Joined group successfully' })
  @ApiResponse({ status: 404, description: 'Invalid invite code' })
  async joinGroup(@Body() dto: JoinGroupDto, @Request() req: any) {
    return await this.groupsService.joinByCode(req.user.sub as string, dto);
  }

  
  @Post('invite')
  @UseGuards(AuthGuard, GroupRoleGuard)
  @RequireGroupRole('leader')
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Mời thành viên vào nhóm (chỉ leader)' })
  @ApiResponse({ status: 200, description: 'Member invited successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not leader' })
  async inviteMember(@Body() dto: InviteMemberDto, @Request() req: any) {
    return await this.groupsService.inviteMember(req.user.sub as string, dto);
  }

  @Post(':groupId/approve-join/:userId')
  @UseGuards(AuthGuard, GroupRoleGuard)
  @RequireGroupRole('leader')
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Duyệt yêu cầu tham gia nhóm (chỉ leader)' })
  @ApiResponse({ status: 200, description: 'Join request approved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not leader' })
  async approveJoinRequest(
    @Param('groupId') groupId: string,
    @Param('userId') userId: string,
    @Request() req: any,
  ) {
    return await this.groupsService.approveJoinRequest(
      groupId,
      userId,
      req.user.sub as string,
    );
  }

  @Post(':groupId/reject-join/:userId')
  @UseGuards(AuthGuard, GroupRoleGuard)
  @RequireGroupRole('leader')
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Từ chối yêu cầu tham gia nhóm (chỉ leader)' })
  @ApiResponse({ status: 200, description: 'Join request rejected successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not leader' })
  async rejectJoinRequest(
    @Param('groupId') groupId: string,
    @Param('userId') userId: string,
    @Request() req: any,
  ) {
    return await this.groupsService.rejectJoinRequest(
      groupId,
      userId,
      req.user.sub as string,
    );
  }

  @Get(':id/pending-join-requests')
  @UseGuards(AuthGuard, GroupRoleGuard)
  @RequireGroupRole('leader')
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Lấy danh sách yêu cầu tham gia chờ duyệt (chỉ leader)' })
  @ApiResponse({ status: 200, description: 'Pending join requests retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not leader' })
  async findPendingJoinRequests(@Param('id') id: string, @Request() req: any) {
    return await this.groupsService.findPendingJoinRequests(
      id,
      req.user.sub as string,
    );
  }
}
