import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GroupMember } from './entities/group-member.entity';
import { Group } from 'src/groups/entities/group.entity';
import { User } from 'src/users/entities/user.entity';
import { LeaveGroupDto } from './dto/leave-group.dto';

@Injectable()
export class GroupMemberService {
  constructor(
    @InjectRepository(GroupMember)
    private readonly groupMemberRepo: Repository<GroupMember>,

    @InjectRepository(Group)
    private readonly groupRepo: Repository<Group>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findAllByGroup(groupId: string) {
    const group = await this.groupRepo.findOne({
      where: { id: groupId },
      relations: ['members', 'members.user'],
    });

    if (!group) throw new NotFoundException('Không tìm thấy nhóm');

    return group.members.map((m) => ({
      id: m.user.id,
      name: m.user.name,
      email: m.user.email,
      avatar: m.user.avatar,
      role: m.role,
      joinedAt: m.joinedAt,
    }));
  }

  async leaveGroup(userId: string, dto: LeaveGroupDto) {
    const { groupId } = dto;

    const member = await this.groupMemberRepo.findOne({
      where: { userId, groupId },
      relations: ['group', 'group.leader'],
    });
    if (!member) throw new NotFoundException('Bạn không thuộc nhóm này');

    if (member.role === 'leader') {
      throw new ForbiddenException(
        'Trưởng nhóm không thể rời nhóm, hãy giải tán nhóm thay vào đó.',
      );
    }

    await this.groupMemberRepo.delete({ userId, groupId });
    return { message: 'Đã rời nhóm thành công' };
  }

  async removeMember(leaderId: string, groupId: string, userId: string) {
    const group = await this.groupRepo.findOne({
      where: { id: groupId },
      relations: ['leader'],
    });
    if (!group) throw new NotFoundException('Không tìm thấy nhóm');
    if (group.leader.id !== leaderId)
      throw new ForbiddenException('Chỉ trưởng nhóm mới có thể xóa thành viên');

    const member = await this.groupMemberRepo.findOne({
      where: { groupId, userId },
    });
    if (!member) throw new NotFoundException('Không tìm thấy thành viên này');

    if (member.role === 'leader')
      throw new BadRequestException('Không thể xóa trưởng nhóm');

    await this.groupMemberRepo.delete(member.id);
    return { message: 'Đã xóa thành viên khỏi nhóm' };
  }
}
