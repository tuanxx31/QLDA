import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ColumnEntity } from './entities/column.entity';
import { Project } from 'src/projects/entities/project.entity';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { PermissionsService } from 'src/permissions/permissions.service';
import { ProjectMember } from 'src/project-members/entities/project-member.entity';

@Injectable()
export class ColumnsService {
  constructor(
    @InjectRepository(ColumnEntity)
    private columnRepo: Repository<ColumnEntity>,
    @InjectRepository(Project)
    private projectRepo: Repository<Project>,
    @InjectRepository(ProjectMember)
    private projectMemberRepo: Repository<ProjectMember>,
    private permissionsService: PermissionsService,
  ) {}

  async create(projectId: string, dto: CreateColumnDto, userId: string) {
    const project = await this.projectRepo.findOne({
      where: { id: projectId },
      relations: ['columns'],
    });
    if (!project) throw new NotFoundException('Không tìm thấy dự án.');
  
    // Kiểm tra quyền sử dụng PermissionsService
    const canEdit = await this.permissionsService.canEditColumn(projectId, userId);
    if (!canEdit) {
      throw new ForbiddenException('Không có quyền tạo cột.');
    }
  
    const maxOrder =
      project.columns?.length > 0
        ? Math.max(...project.columns.map((c) => c.order ?? 0))
        : 0;
  
    const column = this.columnRepo.create({
      ...dto,
      order: maxOrder + 1,
      project,
    });
  
    return this.columnRepo.save(column);
  }
  

  async findAll(projectId: string, userId: string) {
    // Kiểm tra quyền truy cập project
    const isMember = await this.permissionsService.isProjectMember(projectId, userId);
    if (!isMember) {
      throw new ForbiddenException('Bạn không có quyền truy cập dự án này.');
    }

    const columns = await this.columnRepo.find({
      where: { project: { id: projectId } },
      relations: [
        'tasks',
        'tasks.subtasks',
        'tasks.assignees',
        'tasks.labels',
      ],
      order: {
        order: 'ASC',
        tasks: {
          position: 'ASC',
        },
      },
    });

    // Filter assignees theo project members cho tất cả tasks
    if (columns.length > 0) {
      const projectMembers = await this.projectMemberRepo.find({
        where: { project: { id: projectId } },
        relations: ['user'],
      });

      const projectMemberUserIds = new Set(
        projectMembers.map((pm) => pm.user.id),
      );

      columns.forEach((column) => {
        if (column.tasks) {
          column.tasks.forEach((task) => {
            task.assignees = task.assignees.filter((assignee) =>
              projectMemberUserIds.has(assignee.id),
            );
          });
        }
      });
    }

    return columns;
  }
  

  async update(id: string, dto: UpdateColumnDto, userId?: string) {
    const column = await this.columnRepo.findOne({
      where: { id },
      relations: ['project'],
    });
    if (!column) throw new NotFoundException('Không tìm thấy cột.');

    // Kiểm tra quyền nếu có userId
    if (userId) {
      const canEdit = await this.permissionsService.canEditColumn(
        column.project.id,
        userId,
      );
      if (!canEdit) {
        throw new ForbiddenException('Không có quyền cập nhật cột.');
      }
    }

    Object.assign(column, dto);
    return this.columnRepo.save(column);
  }

  async remove(id: string, userId?: string) {
    const column = await this.columnRepo.findOne({
      where: { id },
      relations: ['project'],
    });
    if (!column) throw new NotFoundException('Không tìm thấy cột.');

    // Kiểm tra quyền nếu có userId
    if (userId) {
      const canEdit = await this.permissionsService.canEditColumn(
        column.project.id,
        userId,
      );
      if (!canEdit) {
        throw new ForbiddenException('Không có quyền xóa cột.');
      }
    }

    await this.columnRepo.remove(column);
    return { message: 'Đã xóa cột thành công.' };
  }
}
