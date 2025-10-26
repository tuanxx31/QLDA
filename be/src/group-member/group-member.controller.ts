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
import { GroupMemberService } from './group-member.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LeaveGroupDto } from './dto/leave-group.dto';

@ApiTags('Group Members')
@Controller('group-members')
@UseGuards(AuthGuard)
@ApiBearerAuth('jwt')
export class GroupMemberController {
  constructor(private readonly groupMemberService: GroupMemberService) {}

  @Get(':groupId')
  @ApiOperation({ summary: 'Lấy danh sách thành viên của nhóm' })
  async findAll(@Param('groupId') groupId: string) {
    return await this.groupMemberService.findAllByGroup(groupId);
  }

  @Post('leave')
  @ApiOperation({ summary: 'Rời khỏi nhóm' })
  async leaveGroup(@Request() req: any, @Body() dto: LeaveGroupDto) {
    return await this.groupMemberService.leaveGroup(
      req.user.sub as string,
      dto,
    );
  }

  @Delete(':groupId/:userId')
  @ApiOperation({ summary: 'Xóa thành viên khỏi nhóm (chỉ leader)' })
  async removeMember(
    @Param('groupId') groupId: string,
    @Param('userId') userId: string,
    @Request() req: any,
  ) {
    return await this.groupMemberService.removeMember(
      req.user.sub as string,
      groupId,
      userId,
    );
  }

  @Put(':id/transfer-leader/:userId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Chuyển quyền trưởng nhóm' })
  async transferLeader(
    @Param('id') groupId: string,
    @Param('userId') newLeaderId: string,
    @Request() req: any,
  ) {
    return await this.groupMemberService.transferLeader(
      req.user.sub as string,
      groupId,
      newLeaderId,
    );
  }
}
