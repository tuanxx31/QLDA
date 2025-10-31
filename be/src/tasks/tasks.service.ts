import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { ColumnEntity } from 'src/columns/entities/column.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepo: Repository<Task>,
    @InjectRepository(ColumnEntity)
    private columnRepo: Repository<ColumnEntity>,
  ) {}

  async create(columnId: string, dto: CreateTaskDto) {
    const column = await this.columnRepo.findOne({ where: { id: columnId } });
    if (!column) throw new NotFoundException('Không tìm thấy cột.');
    const task = this.taskRepo.create({ ...dto, column });
    return this.taskRepo.save(task);
  }

  findAll(columnId: string) {
    return this.taskRepo.find({
      where: { column: { id: columnId } },
      relations: ['subtasks', 'assignees'],
      order: { createdAt: 'ASC' },
    });
  }

  async update(id: string, dto: UpdateTaskDto) {
    const task = await this.taskRepo.findOne({ where: { id } });
    if (!task) throw new NotFoundException('Không tìm thấy nhiệm vụ.');
    Object.assign(task, dto);
    return this.taskRepo.save(task);
  }

  async remove(id: string) {
    const task = await this.taskRepo.findOne({ where: { id } });
    if (!task) throw new NotFoundException('Không tìm thấy nhiệm vụ.');
    await this.taskRepo.remove(task);
    return { message: 'Đã xóa nhiệm vụ.' };
  }
}
