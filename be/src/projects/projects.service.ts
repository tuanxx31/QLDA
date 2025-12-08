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
import { Task } from 'src/tasks/entities/task.entity';
import { ColumnEntity } from 'src/columns/entities/column.entity';

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

    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,

    @InjectRepository(ColumnEntity)
    private readonly columnRepo: Repository<ColumnEntity>,
  ) {}

  

  async create(dto: CreateProjectDto, userId: string) {
    const owner = await this.userRepo.findOne({ where: { id: userId } });
    if (!owner) throw new NotFoundException('Không tìm thấy người dùng.');

    let group: Group | null = null;
    if (dto.groupId) {
      group = await this.groupRepo.findOne({ where: { id: dto.groupId } });
      if (!group) throw new NotFoundException('Không tìm thấy nhóm.');
    }

    const project = this.projectRepo.create({
      ...dto,
      owner,
      group,
    });

    const saved: Project = await this.projectRepo.save(project);

    const leaderMember = this.projectMemberRepo.create({
      project: { id: saved.id } as Project,
      user: { id: owner.id } as User,
      role: 'leader',
    });
    await this.projectMemberRepo.save(leaderMember);

    return saved;
  }

  async getProjectProgress(projectId: string) {
    
    const project = await this.projectRepo.findOne({ where: { id: projectId } });
    if (!project) {
      throw new NotFoundException('Không tìm thấy dự án.');
    }

    const tasks = await this.taskRepo
      .createQueryBuilder('task')
      .innerJoin('task.column', 'column')
      .where('column.project_id = :projectId', { projectId })
      .getMany();

    const total = tasks.length;
    const done = tasks.filter((t) => t.status === 'done').length;

    const progress = total === 0 ? 0 : (done / total) * 100;

    return {
      progress: Math.round(progress * 100) / 100,
      totalTasks: total,
      doneTasks: done,
      todoTasks: total - done,
    };
  }

  async getColumnProgress(projectId: string) {
    
    const project = await this.projectRepo.findOne({ where: { id: projectId } });
    if (!project) {
      throw new NotFoundException('Không tìm thấy dự án.');
    }

    const columns = await this.columnRepo.find({
      where: { project: { id: projectId } },
      order: { order: 'ASC' },
    });

    const result = await Promise.all(
      columns.map(async (column) => {
        const tasks = await this.taskRepo.find({
          where: { columnId: column.id },
        });

        const total = tasks.length;
        const done = tasks.filter((t) => t.status === 'done').length;
        const progress = total === 0 ? 0 : (done / total) * 100;

        return {
          columnId: column.id,
          columnName: column.name,
          totalTasks: total,
          doneTasks: done,
          todoTasks: total - done,
          progress: Math.round(progress * 100) / 100,
        };
      }),
    );

    return result;
  }

  async getUserProgress(projectId: string) {
    
    const project = await this.projectRepo.findOne({ where: { id: projectId } });
    if (!project) {
      throw new NotFoundException('Không tìm thấy dự án.');
    }

    
    const tasks = await this.taskRepo
      .createQueryBuilder('task')
      .innerJoin('task.column', 'column')
      .leftJoinAndSelect('task.assignees', 'assignees')
      .where('column.project_id = :projectId', { projectId })
      .getMany();

    
    const userStatsMap = new Map<
      string,
      {
        userId: string;
        avatar: string;
        name: string;
        totalTasks: number;
        doneTasks: number;
        todoTasks: number;
      }
    >();

    
    for (const task of tasks) {
      if (task.assignees && task.assignees.length > 0) {
        for (const assignee of task.assignees) {
          if (!userStatsMap.has(assignee.id)) {
            userStatsMap.set(assignee.id, {
              userId: assignee.id,
              avatar: assignee.avatar || 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
              name: assignee.name || assignee.email,
              totalTasks: 0,
              doneTasks: 0,
              todoTasks: 0,
            });
          }

          const stats = userStatsMap.get(assignee.id)!;
          stats.totalTasks++;
          if (task.status === 'done') {
            stats.doneTasks++;
          } else {
            stats.todoTasks++;
          }
        }
      }
    }

    
    const result = Array.from(userStatsMap.values()).map((stats) => {
      const progress =
        stats.totalTasks === 0 ? 0 : (stats.doneTasks / stats.totalTasks) * 100;
      return {
        ...stats,
        progress: Math.round(progress * 100) / 100,
      };
    });

    
    return result.sort((a, b) => b.totalTasks - a.totalTasks);
  }

  async getDeadlineSummary(projectId: string) {
    
    const project = await this.projectRepo.findOne({ where: { id: projectId } });
    if (!project) {
      throw new NotFoundException('Không tìm thấy dự án.');
    }

    const now = new Date();
    const threeDaysLater = new Date(now);
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);

    const tasks = await this.taskRepo
      .createQueryBuilder('task')
      .innerJoin('task.column', 'column')
      .where('column.project_id = :projectId', { projectId })
      .andWhere('task.dueDate IS NOT NULL')
      .getMany();

    let overdue = 0;
    let dueSoon = 0;
    let completedOnTime = 0;
    let completedLate = 0;

    for (const task of tasks) {
      if (!task.dueDate) continue;

      const dueDate = new Date(task.dueDate);
      const isOverdue = dueDate < now && task.status !== 'done';
      const isDueSoon =
        dueDate >= now &&
        dueDate <= threeDaysLater &&
        task.status !== 'done';

      if (isOverdue) {
        overdue++;
      } else if (isDueSoon) {
        dueSoon++;
      }

      
      if (task.status === 'done' && task.completedAt) {
        const completedAt = new Date(task.completedAt);
        if (completedAt <= dueDate) {
          completedOnTime++;
        } else {
          completedLate++;
        }
      }
    }

    return {
      overdue,
      dueSoon,
      completedOnTime,
      completedLate,
    };
  }

  async findAllByUser(userId: string) {
    return this.projectRepo
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.owner', 'owner')
      .leftJoinAndSelect('project.group', 'group')
      .leftJoinAndSelect('project.members', 'members')
      .leftJoinAndSelect('members.user', 'memberUser')
      .where(
        'owner.id = :userId OR memberUser.id = :userId',
        { userId },
      )
      .orderBy('project.created_at', 'DESC')
      .getMany();
  }

  async findAllByGroup(groupId: string, userId: string) {
    const group = await this.groupRepo.findOne({
      where: { id: groupId },
      relations: ['members', 'members.user'],
    });

    if (!group) {
      throw new NotFoundException('Không tìm thấy nhóm.');
    }

    const member = group.members.find((m) => m.user.id === userId);
    const isLeader = member?.role === 'leader';

    const whereCondition = isLeader
      ? { group: { id: groupId } }
      : {
          group: { id: groupId },
          members: { user: { id: userId } },
        };

    return this.projectRepo.find({
      where: whereCondition,
      relations: ['group', 'members', 'members.user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const project = await this.projectRepo.findOne({
      where: { id },
      relations: ['group', 'owner', 'members', 'members.user'],
    });
    if (!project) throw new NotFoundException('Không tìm thấy dự án.');
    return project;
  }

  async update(id: string, dto: UpdateProjectDto, userId: string) {
    const project = await this.projectRepo.findOne({
      where: { id },
      relations: ['owner', 'members', 'members.user'],
    });
    if (!project) throw new NotFoundException('Không tìm thấy dự án.');

    const isOwner = project.owner.id === userId;
    const isLeader = project.members.some(
      (m) => m.user.id === userId && m.role === 'leader',
    );

    if (!isOwner && !isLeader)
      throw new ForbiddenException('Không có quyền chỉnh sửa dự án.');

    Object.assign(project, dto);

    if (dto.group && dto.group.id == '0') {
      project.group = null;
    }

    return this.projectRepo.save(project);
  }

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

    project.group = group;
    await this.projectRepo.save(project);

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
