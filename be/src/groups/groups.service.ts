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

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepo: Repository<Group>,

    @InjectRepository(GroupMember)
    private readonly groupMemberRepo: Repository<GroupMember>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // 🟢 1. Tạo nhóm mới
  async create(createGroupDto: CreateGroupDto, userId: string) {
    const leader = await this.userRepo.findOne({ where: { id: userId } });
    if (!leader) throw new NotFoundException('Không tìm thấy người dùng');

    // 🔁 Sinh mã mời ngẫu nhiên duy nhất
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
        status: 'accepted', // ✅ chỉ lấy nhóm đã tham gia
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
      where: { user: { id: userId }, status: 'pending' },
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
  async acceptInvite(groupId: string, userId: string) {
    const member = await this.groupMemberRepo.findOne({
      where: { group: { id: groupId }, user: { id: userId } },
    });
  
    if (!member) throw new NotFoundException('Không tìm thấy lời mời');
    if (member.status !== 'pending')
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
    if (member.status !== 'pending')
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

    // ✅ Kiểm tra quyền truy cập
    const isLeader = group.leader.id === userId;
    const isMember = group.members.some(
      (m) => m.user.id === userId && m.status === 'accepted',
    );

    if (!isLeader && !isMember) {
      throw new ForbiddenException('Bạn không có quyền truy cập nhóm này');
    }

    // ✅ Chuẩn hóa danh sách thành viên
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

  // 🟢 4. Cập nhật nhóm
  async update(id: string, userId: string, dto: UpdateGroupDto) {
    const group = await this.groupRepo.findOne({
      where: { id },
      relations: ['leader'],
    });
    if (!group) throw new NotFoundException('Không tìm thấy nhóm');
    if (group.leader.id !== userId)
      throw new ForbiddenException('Chỉ trưởng nhóm mới được cập nhật');

    Object.assign(group, dto);
    return await this.groupRepo.save(group);
  }

  // 🟢 5. Giải tán nhóm
  async remove(id: string, userId: string) {
    const group = await this.groupRepo.findOne({
      where: { id },
      relations: ['leader'],
    });
    if (!group) throw new NotFoundException('Không tìm thấy nhóm');
    if (group.leader.id !== userId)
      throw new ForbiddenException('Chỉ trưởng nhóm mới có quyền xóa');

    await this.groupRepo.delete(id);
    return { message: 'Đã giải tán nhóm' };
  }

  // 🟢 6. Tham gia nhóm bằng mã mời
  async joinByCode(userId: string, dto: JoinGroupDto) {
    const inviteCode = dto.inviteCode.trim().toUpperCase();
    const group = await this.groupRepo.findOne({ where: { inviteCode } });
    if (!group) throw new NotFoundException('Mã nhóm không hợp lệ');

    const exist = await this.groupMemberRepo.findOne({
      where: { user: { id: userId }, group: { id: group.id } },
    });
    if (exist)
      throw new BadRequestException('Bạn đã tham gia hoặc đang được mời');

    const member = this.groupMemberRepo.create({
      group: { id: group.id },
      user: { id: userId },
      role: 'member',
      status: 'accepted',
    });
    await this.groupMemberRepo.save(member);

    return { message: 'Đã tham gia nhóm thành công', groupId: group.id };
  }

  // 🟢 7. Mời thành viên
  async inviteMember(leaderId: string, dto: InviteMemberDto) {
    const { groupId, userId, email } = dto;

    const group = await this.groupRepo.findOne({
      where: { id: groupId },
      relations: ['leader'],
    });
    if (!group) throw new NotFoundException('Không tìm thấy nhóm');
    if (group.leader.id !== leaderId)
      throw new ForbiddenException('Chỉ trưởng nhóm mới có quyền mời');

    let memberUser: User | null = null;
    if (userId) memberUser = await this.userRepo.findOne({ where: { id: userId } });
    else if (email)
      memberUser = await this.userRepo.findOne({ where: { email } });

    if (!memberUser)
      throw new NotFoundException('Không tìm thấy người dùng cần mời');

    const exist = await this.groupMemberRepo.findOne({
      where: { group: { id: groupId }, user: { id: memberUser.id } },
    });
    if (exist)
      throw new BadRequestException('Người dùng đã ở trong nhóm hoặc đang chờ duyệt');

    const newMember = this.groupMemberRepo.create({
      group: { id: groupId },
      user: memberUser,
      role: 'member',
      status: 'pending',
    });
    await this.groupMemberRepo.save(newMember);

    return {
      message: 'Đã gửi lời mời thành viên',
      inviteCode: group.inviteCode,
    };
  }
}
