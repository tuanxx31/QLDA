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

@Injectable()
export class ColumnsService {
  constructor(
    @InjectRepository(ColumnEntity)
    private columnRepo: Repository<ColumnEntity>,
    @InjectRepository(Project)
    private projectRepo: Repository<Project>,
  ) {}

  async create(projectId: string, dto: CreateColumnDto, userId: string) {
    const project = await this.projectRepo.findOne({
      where: { id: projectId },
      relations: ['members', 'owner', 'members.user'],
    });
    if (!project) throw new NotFoundException('Không tìm thấy dự án.');
    const isMember =
      project.members?.some((m) => m.user.id === userId) ||
      project.owner.id === userId;
    if (!isMember) throw new ForbiddenException('Không có quyền tạo cột.');

    const column = this.columnRepo.create({ ...dto, project });
    return this.columnRepo.save(column);
  }

  findAll(projectId: string) {
    return this.columnRepo.find({
      where: { project: { id: projectId } },
      relations: ['tasks', 'tasks.subtasks'],
      order: { order: 'ASC' },
    });
  }

  async update(id: string, dto: UpdateColumnDto) {
    const column = await this.columnRepo.findOne({ where: { id } });
    if (!column) throw new NotFoundException('Không tìm thấy cột.');
    Object.assign(column, dto);
    return this.columnRepo.save(column);
  }

  async remove(id: string) {
    const column = await this.columnRepo.findOne({ where: { id } });
    if (!column) throw new NotFoundException('Không tìm thấy cột.');
    await this.columnRepo.remove(column);
    return { message: 'Đã xóa cột thành công.' };
  }
}
