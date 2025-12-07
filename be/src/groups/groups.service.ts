import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from './entities/group.entity';
import { User } from 'src/users/entities/user.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { GroupMember } from 'src/group-member/entities/group-member.entity';
import { JoinGroupDto } from './dto/join-group.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { PermissionsService } from 'src/permissions/permissions.service';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepo: Repository<Group>,

    @InjectRepository(GroupMember)
    private readonly groupMemberRepo: Repository<GroupMember>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    private readonly permissionsService: PermissionsService,
  ) {}

  
  async create(createGroupDto: CreateGroupDto, userId: string) {
    const leader = await this.userRepo.findOne({ where: { id: userId } });
    if (!leader) throw new NotFoundException('Không tìm thấy người dùng');

    
    let inviteCode: string;
    while (true) {
      inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const exist = await this.groupRepo.findOne({ where: { inviteCode } });
      if (!exist) break;
    }

    const group = this.groupRepo.create({
      ...createGroupDto,
      inviteCode,
      leader,
    });

    const saved = await this.groupRepo.save(group);

    const member = this.groupMemberRepo.create({
      group: { id: saved.id },
      user: { id: userId },
      role: 'leader',
      status: 'accepted',
    });
    await this.groupMemberRepo.save(member);

    return saved;
  }

  async findAllByUser(userId: string) {
    const memberships = await this.groupMemberRepo.find({
      where: {
        user: { id: userId },
        status: 'accepted', 
      },
      relations: ['group', 'group.leader', 'user'],
      order: { joinedAt: 'DESC' },
    });

    return memberships.map((m) => ({
      id: m.group.id,
      name: m.group.name,
      description: m.group.description,
      inviteCode: m.group.inviteCode,
      leader: {
        id: m.group.leader.id,
        name: m.group.leader.name,
        email: m.group.leader.email,
      },
      role: m.role,
      joinedAt: m.joinedAt,
    }));
  }

  async findPendingInvites(userId: string) {
    const invites = await this.groupMemberRepo.find({
      where: { user: { id: userId }, status: 'pending_invite' },
      relations: ['group', 'group.leader'],
      order: { joinedAt: 'DESC' },
    });

    return invites.map((m) => ({
      groupId: m.group.id,
      groupName: m.group.name,
      leader: {
        id: m.group.leader.id,
        name: m.group.leader.name,
        email: m.group.leader.email,
      },
      invitedAt: m.joinedAt,
    }));
  }

  async findPendingApprovals(userId: string) {
    const approvals = await this.groupMemberRepo.find({
      where: { user: { id: userId }, status: 'pending_approval' },
      relations: ['group', 'group.leader'],
      order: { joinedAt: 'DESC' },
    });

    return approvals.map((m) => ({
      groupId: m.group.id,
      groupName: m.group.name,
      leader: {
        id: m.group.leader.id,
        name: m.group.leader.name,
        email: m.group.leader.email,
      },
      requestedAt: m.joinedAt,
    }));
  }
  async acceptInvite(groupId: string, userId: string) {
    const member = await this.groupMemberRepo.findOne({
      where: { group: { id: groupId }, user: { id: userId } },
    });

    if (!member) throw new NotFoundException('Không tìm thấy lời mời');
    if (member.status !== 'pending_invite')
      throw new BadRequestException('Lời mời đã được xử lý');

    member.status = 'accepted';
    await this.groupMemberRepo.save(member);
    return { message: 'Đã tham gia nhóm thành công' };
  }

  async rejectInvite(groupId: string, userId: string) {
    const member = await this.groupMemberRepo.findOne({
      where: { group: { id: groupId }, user: { id: userId } },
    });

    if (!member) throw new NotFoundException('Không tìm thấy lời mời');
    if (member.status !== 'pending_invite')
      throw new BadRequestException('Lời mời đã được xử lý');

    member.status = 'rejected';
    await this.groupMemberRepo.save(member);
    return { message: 'Đã từ chối lời mời' };
  }

  async findOne(id: string, userId: string) {
    const group = await this.groupRepo.findOne({
      where: { id },
      relations: ['leader', 'members', 'members.user'],
    });

    if (!group) {
      throw new NotFoundException('Không tìm thấy nhóm');
    }

    
    const isLeader = group.leader.id === userId;
    const isMember = group.members.some(
      (m) => m.user.id === userId && m.status === 'accepted',
    );
    const hasPendingRequest = group.members.some(
      (m) => m.user.id === userId && (m.status === 'pending_invite' || m.status === 'pending_approval'),
    );

    if (!isLeader && !isMember && !hasPendingRequest) {
      throw new ForbiddenException('Bạn không có quyền truy cập nhóm này');
    }

    
    const members = group.members.map((m) => ({
      id: m.user.id,
      name: m.user.name,
      email: m.user.email,
      avatar: m.user.avatar,
      role: m.role,
      status: m.status,
      joinedAt: m.joinedAt,
    }));

    return {
      id: group.id,
      name: group.name,
      description: group.description,
      inviteCode: group.inviteCode,
      leader: {
        id: group.leader.id,
        name: group.leader.name,
        email: group.leader.email,
      },
      members,
      createdAt: group.createdAt,
    };
  }

  async update(id: string, userId: string, dto: UpdateGroupDto) {
    const group = await this.groupRepo.findOne({
      where: { id },
    });
    if (!group) throw new NotFoundException('Không tìm thấy nhóm');

    // Kiểm tra quyền sử dụng PermissionsService
    const canEdit = await this.permissionsService.canEditGroup(id, userId);
    if (!canEdit) {
      throw new ForbiddenException('Chỉ trưởng nhóm mới được cập nhật');
    }

    Object.assign(group, dto);
    return await this.groupRepo.save(group);
  }

  async remove(id: string, userId: string) {
    const group = await this.groupRepo.findOne({
      where: { id },
    });
    if (!group) throw new NotFoundException('Không tìm thấy nhóm');

    // Kiểm tra quyền sử dụng PermissionsService
    const canDelete = await this.permissionsService.canDeleteGroup(id, userId);
    if (!canDelete) {
      throw new ForbiddenException('Chỉ trưởng nhóm mới có quyền xóa');
    }

    await this.groupRepo.delete(id);
    return { message: 'Đã giải tán nhóm' };
  }

  async joinByCode(userId: string, dto: JoinGroupDto) {
    const inviteCode = dto.inviteCode.trim().toUpperCase();
    const group = await this.groupRepo.findOne({ where: { inviteCode } });
    if (!group) throw new NotFoundException('Mã nhóm không hợp lệ');

    const exist = await this.groupMemberRepo.findOne({
      where: { user: { id: userId }, group: { id: group.id } },
    });
    if (exist)
      throw new BadRequestException('Bạn đã tham gia hoặc đang chờ duyệt');

    const member = this.groupMemberRepo.create({
      group: { id: group.id },
      user: { id: userId },
      role: 'member',
      status: 'pending_approval',
    });
    await this.groupMemberRepo.save(member);

    return { message: 'Đã gửi yêu cầu tham gia nhóm. Chờ trưởng nhóm duyệt', groupId: group.id };
  }

  async inviteMember(leaderId: string, dto: InviteMemberDto) {
    const { groupId, userId, email } = dto;

    const group = await this.groupRepo.findOne({
      where: { id: groupId },
    });
    if (!group) throw new NotFoundException('Không tìm thấy nhóm');

    // Kiểm tra quyền sử dụng PermissionsService
    const canInvite = await this.permissionsService.canInviteMembers(
      groupId,
      leaderId,
    );
    if (!canInvite) {
      throw new ForbiddenException('Chỉ trưởng nhóm mới có quyền mời');
    }

    let memberUser: User | null = null;
    if (userId)
      memberUser = await this.userRepo.findOne({ where: { id: userId } });
    else if (email)
      memberUser = await this.userRepo.findOne({ where: { email } });

    if (!memberUser)
      throw new NotFoundException('Không tìm thấy người dùng cần mời');

    const exist = await this.groupMemberRepo.findOne({
      where: { group: { id: groupId }, user: { id: memberUser.id } },
    });
    if (exist)
      throw new BadRequestException(
        'Người dùng đã ở trong nhóm hoặc đang chờ duyệt',
      );

    const newMember = this.groupMemberRepo.create({
      group: { id: groupId },
      user: memberUser,
      role: 'member',
      status: 'pending_invite',
    });
    await this.groupMemberRepo.save(newMember);

    return {
      message: 'Đã gửi lời mời thành viên',
      inviteCode: group.inviteCode,
    };
  }

  async approveJoinRequest(groupId: string, userId: string, leaderId: string) {
    const group = await this.groupRepo.findOne({
      where: { id: groupId },
      relations: ['leader'],
    });
    if (!group) throw new NotFoundException('Không tìm thấy nhóm');
    if (group.leader.id !== leaderId)
      throw new ForbiddenException('Chỉ trưởng nhóm mới có quyền duyệt');

    const member = await this.groupMemberRepo.findOne({
      where: { group: { id: groupId }, user: { id: userId } },
    });
    if (!member) throw new NotFoundException('Không tìm thấy yêu cầu tham gia');
    if (member.status !== 'pending_approval')
      throw new BadRequestException('Yêu cầu đã được xử lý');

    member.status = 'accepted';
    await this.groupMemberRepo.save(member);
    return { message: 'Đã duyệt yêu cầu tham gia nhóm' };
  }

  async rejectJoinRequest(groupId: string, userId: string, leaderId: string) {
    const group = await this.groupRepo.findOne({
      where: { id: groupId },
      relations: ['leader'],
    });
    if (!group) throw new NotFoundException('Không tìm thấy nhóm');
    if (group.leader.id !== leaderId)
      throw new ForbiddenException('Chỉ trưởng nhóm mới có quyền từ chối');

    const member = await this.groupMemberRepo.findOne({
      where: { group: { id: groupId }, user: { id: userId } },
    });
    if (!member) throw new NotFoundException('Không tìm thấy yêu cầu tham gia');
    if (member.status !== 'pending_approval')
      throw new BadRequestException('Yêu cầu đã được xử lý');

    member.status = 'rejected';
    await this.groupMemberRepo.save(member);
    return { message: 'Đã từ chối yêu cầu tham gia nhóm' };
  }

  async findPendingJoinRequests(groupId: string, leaderId: string) {
    const group = await this.groupRepo.findOne({
      where: { id: groupId },
      relations: ['leader'],
    });
    if (!group) throw new NotFoundException('Không tìm thấy nhóm');
    if (group.leader.id !== leaderId)
      throw new ForbiddenException('Chỉ trưởng nhóm mới có quyền xem');

    const requests = await this.groupMemberRepo.find({
      where: { group: { id: groupId }, status: 'pending_approval' },
      relations: ['user'],
      order: { joinedAt: 'DESC' },
    });

    return requests.map((m) => ({
      id: m.user.id,
      name: m.user.name,
      email: m.user.email,
      avatar: m.user.avatar,
      requestedAt: m.joinedAt,
    }));
  }
}
