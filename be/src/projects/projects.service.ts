import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { User } from 'src/users/entities/user.entity';
import { Group } from 'src/groups/entities/group.entity';
import { ProjectMember } from 'src/project-members/entities/project-member.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Group)
    private readonly groupRepo: Repository<Group>,

    @InjectRepository(ProjectMember)
    private readonly projectMemberRepo: Repository<ProjectMember>,
  ) {}

  async create(dto: CreateProjectDto, userId: string) {
    const owner = await this.userRepo.findOne({ where: { id: userId } });
    if (!owner) throw new NotFoundException('Không tìm thấy người dùng.');
  
    let group: Group | null = null;
    if (dto.groupId) {
      group = await this.groupRepo.findOne({ where: { id: dto.groupId } });
      if (!group) throw new NotFoundException('Không tìm thấy nhóm.');
    }
  
    // ✅ Tạo entity đúng kiểu
    const project = this.projectRepo.create({
      name: dto.name,
      description: dto.description,
      deadline: dto.deadline ? new Date(dto.deadline) : undefined, // ✅ Không dùng null
      status: dto.status || 'todo',
      owner,
      group,
      manager: owner,
    });
  
    // ✅ Ép kiểu rõ ràng để tránh TypeORM nhầm overload
    const saved: Project = await this.projectRepo.save(project);
  
    // ✅ Tạo leader member
    const leaderMember = this.projectMemberRepo.create({
      project: { id: saved.id } as Project,
      user: { id: owner.id } as User,
      role: 'leader',
    });
    await this.projectMemberRepo.save(leaderMember);
  
    return saved;
  }
  
  

  /** 🟢 Lấy tất cả dự án của user (owner, manager, hoặc member) */
  async findAllByUser(userId: string) {
    return this.projectRepo
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.owner', 'owner')
      .leftJoinAndSelect('project.manager', 'manager')
      .leftJoinAndSelect('project.group', 'group')
      .leftJoinAndSelect('project.members', 'members')
      .leftJoinAndSelect('members.user', 'memberUser')
      .where('owner.id = :userId OR manager.id = :userId OR memberUser.id = :userId', { userId })
      .orderBy('project.created_at', 'DESC')
      .getMany();
  }

  /** 🟢 Lấy danh sách dự án theo group */
  async findAllByGroup(groupId: string) {
    return this.projectRepo.find({
      where: { group: { id: groupId } },
      relations: ['group', 'owner', 'manager', 'members', 'members.user'],
      order: { createdAt: 'DESC' },
    });
  }

  /** 🟢 Lấy chi tiết dự án */
  async findOne(id: string) {
    const project = await this.projectRepo.findOne({
      where: { id },
      relations: ['group', 'owner', 'manager', 'members', 'members.user'],
    });
    if (!project) throw new NotFoundException('Không tìm thấy dự án.');
    return project;
  }

  /** 🟢 Cập nhật thông tin dự án */
  async update(id: string, dto: UpdateProjectDto, userId: string) {
    const project = await this.projectRepo.findOne({
      where: { id },
      relations: ['owner', 'manager'],
    });
    if (!project) throw new NotFoundException('Không tìm thấy dự án.');

    if (project.owner.id !== userId && project.manager?.id !== userId)
      throw new ForbiddenException('Không có quyền chỉnh sửa dự án.');

    Object.assign(project, dto);
    return this.projectRepo.save(project);
  }

  /** 🟢 Xóa dự án */
  async remove(id: string, userId: string) {
    const project = await this.projectRepo.findOne({
      where: { id },
      relations: ['owner'],
    });
    if (!project) throw new NotFoundException('Không tìm thấy dự án.');
    if (project.owner.id !== userId)
      throw new ForbiddenException('Chỉ chủ sở hữu mới có thể xóa dự án.');

    await this.projectRepo.remove(project);
    return { message: 'Đã xóa dự án thành công.' };
  }

  /** 🟢 Chuyển dự án cá nhân thành dự án nhóm */
  async convertToGroup(projectId: string, groupId: string, userId: string) {
    const project = await this.projectRepo.findOne({
      where: { id: projectId },
      relations: ['owner', 'group', 'members', 'members.user'],
    });
    if (!project) throw new NotFoundException('Không tìm thấy dự án.');

    if (project.owner.id !== userId)
      throw new ForbiddenException('Chỉ chủ sở hữu mới được chuyển dự án.');

    const group = await this.groupRepo.findOne({
      where: { id: groupId },
      relations: ['members', 'members.user'],
    });
    if (!group) throw new NotFoundException('Không tìm thấy nhóm.');

    // Gán group vào project
    project.group = group;
    await this.projectRepo.save(project);

    // Thêm thành viên nhóm vào project nếu chưa có
    const existingUserIds = project.members.map((m) => m.user.id);
    const newMembers = group.members.filter(
      (gm) => !existingUserIds.includes(gm.user.id),
    );

    for (const gm of newMembers) {
      const pm = this.projectMemberRepo.create({
        project,
        user: gm.user,
        role: 'viewer',
      });
      await this.projectMemberRepo.save(pm);
    }

    return { message: 'Đã chuyển dự án cá nhân thành dự án nhóm.' };
  }

  /** 🟢 Tách dự án khỏi nhóm (trở thành dự án cá nhân) */
  async removeGroup(projectId: string, userId: string) {
    const project = await this.projectRepo.findOne({
      where: { id: projectId },
      relations: ['owner'],
    });
    if (!project) throw new NotFoundException('Không tìm thấy dự án.');
    if (project.owner.id !== userId)
      throw new ForbiddenException('Chỉ chủ sở hữu mới được tách nhóm.');

    project.group = null;
    await this.projectRepo.save(project);

    return { message: 'Đã tách dự án khỏi nhóm.' };
  }
}
