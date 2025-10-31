import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubTask } from './entities/sub-task.entity';
import { Task } from 'src/tasks/entities/task.entity';
import { CreateSubTaskDto } from './dto/create-sub-task.dto';
import { UpdateSubTaskDto } from './dto/update-sub-task.dto';

@Injectable()
export class SubTasksService {
  constructor(
    @InjectRepository(SubTask)
    private subtaskRepo: Repository<SubTask>,
    @InjectRepository(Task)
    private taskRepo: Repository<Task>,
  ) {}

  async create(taskId: string, dto: CreateSubTaskDto) {
    const task = await this.taskRepo.findOne({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Không tìm thấy nhiệm vụ.');
    const subtask = this.subtaskRepo.create({ ...dto, task });
    return this.subtaskRepo.save(subtask);
  }

  findAll(taskId: string) {
    return this.subtaskRepo.find({ where: { task: { id: taskId } } });
  }

  async update(id: string, dto: UpdateSubTaskDto) {
    const subtask = await this.subtaskRepo.findOne({ where: { id } });
    if (!subtask) throw new NotFoundException('Không tìm thấy công việc con.');
    Object.assign(subtask, dto);
    return this.subtaskRepo.save(subtask);
  }

  async remove(id: string) {
    const subtask = await this.subtaskRepo.findOne({ where: { id } });
    if (!subtask) throw new NotFoundException('Không tìm thấy công việc con.');
    await this.subtaskRepo.remove(subtask);
    return { message: 'Đã xóa công việc con.' };
  }
}
