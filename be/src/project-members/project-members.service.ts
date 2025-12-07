import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { ProjectMember } from './entities/project-member.entity';
import { User } from 'src/users/entities/user.entity';
import { Project } from 'src/projects/entities/project.entity';
import { CreateProjectMemberDto } from './dto/create-project-member.dto';
import { UpdateProjectMemberDto } from './dto/update-project-member.dto';

@Injectable()
export class ProjectMembersService {
  constructor(
    @InjectRepository(ProjectMember)
    private readonly projectMemberRepo: Repository<ProjectMember>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
  ) {}

  async addMember(
    projectId: string,
    dto: CreateProjectMemberDto,
    userId: string,
  ) {
    const project = await this.projectRepo.findOne({
      where: { id: projectId },
      relations: ['owner', 'manager', 'members', 'members.user'],
    });
    if (!project) throw new NotFoundException('Không tìm thấy dự án.');

    const actor = project.members.find((m) => m.user.id === userId);
    if (!actor || (actor.role !== 'leader' && actor.role !== 'editor'))
      throw new ForbiddenException('Không có quyền thêm thành viên.');

    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) throw new NotFoundException('Không tìm thấy người dùng.');

    const already = project.members.find((m) => m.user.id === user.id);
    if (already)
      throw new BadRequestException('Người dùng đã nằm trong dự án.');

    // Kiểm tra nếu đã có leader và đang cố thêm leader mới
    const hasLeader = project.members.some((m) => m.role === 'leader');
    let role = dto.role || 'viewer';
    if (role === 'leader' && hasLeader) {
      throw new BadRequestException(
        'Dự án đã có trưởng dự án. Mỗi dự án chỉ có thể có 1 trưởng dự án. Vui lòng sử dụng chức năng chuyển quyền để thay đổi trưởng dự án.',
      );
    }

    const newMember = this.projectMemberRepo.create({
      project,
      user,
      role,
    });
    return this.projectMemberRepo.save(newMember);
  }

  async getMembers(projectId: string, membersIdExcludeTask: string[]) {
    const members = await this.projectMemberRepo.find({
      where: { project: { id: projectId }, user: { id: Not(In(membersIdExcludeTask)) } },
      relations: ['user', 'project'],
      order: { joinedAt: 'ASC' },
    });
    return members.map((m) => ({
      id: m.id,
      user: m.user,
      role: m.role,
      joinedAt: m.joinedAt,
    }));
  }

  async addMembers(projectId: string, dto: { userIds: string[]; role?: 'viewer' | 'editor' | 'leader' }) {
    const project = await this.projectRepo.findOne({
      where: { id: projectId },
      relations: ['members', 'members.user'],
    });
    if (!project) throw new NotFoundException('Không tìm thấy dự án.');

    const users = await this.userRepo.find({
      where: { id: In(dto.userIds) },
    });
    if (users.length !== dto.userIds.length)
      throw new NotFoundException('Không tìm thấy người dùng.');

    const already = project.members.filter((m) =>
      users.some((u) => u.id === m.user.id),
    );
    if (already.length > 0)
      throw new BadRequestException('Người dùng đã nằm trong dự án.');

    // Kiểm tra nếu đã có leader và đang cố thêm leader mới
    const hasLeader = project.members.some((m) => m.role === 'leader');
    let role = dto.role || 'viewer';
    if (role === 'leader' && hasLeader) {
      throw new BadRequestException(
        'Dự án đã có trưởng dự án. Mỗi dự án chỉ có thể có 1 trưởng dự án. Vui lòng sử dụng chức năng chuyển quyền để thay đổi trưởng dự án.',
      );
    }

    const newMembers = users.map((user) =>
      this.projectMemberRepo.create({
        project,
        user,
        role: role as 'viewer' | 'editor' | 'leader',
      }),
    );
    return this.projectMemberRepo.save(newMembers);
  }
  async updateMemberRole(
    projectId: string,
    memberId: string,
    dto: UpdateProjectMemberDto,
    actorId: string,
  ) {
    const project = await this.projectRepo.findOne({
      where: { id: projectId },
      relations: ['members', 'members.user'],
    });
    if (!project) throw new NotFoundException('Không tìm thấy dự án.');

    const actor = project.members.find((m) => m.user.id === actorId);
    if (!actor || actor.role !== 'leader')
      throw new ForbiddenException(
        'Chỉ leader mới có quyền chỉnh sửa vai trò.',
      );

    const member = await this.projectMemberRepo.findOne({
      where: { id: memberId },
      relations: ['project', 'user'],
    });
    if (!member) throw new NotFoundException('Không tìm thấy thành viên.');

    // Kiểm tra nếu đang cố set role 'leader' cho member khác khi đã có leader
    if (dto.role === 'leader') {
      const existingLeader = project.members.find(
        (m) => m.role === 'leader' && m.id !== memberId,
      );
      if (existingLeader) {
        throw new BadRequestException(
          'Dự án đã có trưởng dự án. Mỗi dự án chỉ có thể có 1 trưởng dự án. Vui lòng sử dụng chức năng chuyển quyền để thay đổi trưởng dự án.',
        );
      }
    }

    member.role = dto.role;
    return this.projectMemberRepo.save(member);
  }

  async removeMember(projectId: string, memberId: string, actorId: string) {
    const project = await this.projectRepo.findOne({
      where: { id: projectId },
      relations: ['members', 'members.user'],
    });
    if (!project) throw new NotFoundException('Không tìm thấy dự án.');

    const actor = project.members.find((m) => m.user.id === actorId);
    if (!actor || (actor.role !== 'leader' && actor.role !== 'editor'))
      throw new ForbiddenException('Không có quyền xóa thành viên.');

    const member = project.members.find((m) => m.id === memberId);
    if (!member) throw new NotFoundException('Không tìm thấy thành viên.');

    await this.projectMemberRepo.remove(member);
    return { message: 'Đã xóa thành viên khỏi dự án.' };
  }

  async transferLeader(
    projectId: string,
    newLeaderId: string,
    actorId: string,
  ) {
    const project = await this.projectRepo.findOne({
      where: { id: projectId },
      relations: ['members', 'members.user'],
    });
    if (!project) throw new NotFoundException('Không tìm thấy dự án.');

    const currentLeader = project.members.find(
      (m) => m.user.id === actorId && m.role === 'leader',
    );
    if (!currentLeader)
      throw new ForbiddenException(
        'Chỉ leader hiện tại mới có thể chuyển quyền.',
      );

    const newLeader = project.members.find((m) => m.user.id === newLeaderId);
    if (!newLeader)
      throw new NotFoundException('Người được chọn không nằm trong dự án.');

    currentLeader.role = 'editor';
    newLeader.role = 'leader';

    await this.projectMemberRepo.save([currentLeader, newLeader]);

    project.manager = newLeader.user;
    await this.projectRepo.save(project);

    return { message: 'Đã chuyển quyền trưởng dự án.' };
  }
}
