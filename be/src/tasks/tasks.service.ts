import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Task } from './entities/task.entity';
import { Label } from 'src/labels/entities/label.entity';
import { User } from 'src/users/entities/user.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AssignUsersDto } from './dto/assign.dto';
import { SubTask } from 'src/sub-tasks/entities/sub-task.entity';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task) private taskRepo: Repository<Task>,
    @InjectRepository(SubTask) private subRepo: Repository<SubTask>,
    @InjectRepository(Label) private labelRepo: Repository<Label>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async getAssignees(id: string) {
    const task = await this.taskRepo.findOne({
      where: { id },
      relations: ['assignees'],
    });
    if (!task) throw new NotFoundException('Task không tồn tại');
    return task.assignees;
  }

  async findByColumn(columnId: string) {
    return this.taskRepo.find({
      where: { columnId },
      relations: ['assignees', 'labels', 'subtasks'],
      order: { position: 'ASC' },
    });
  }

  async create(dto: CreateTaskDto, creatorId: string) {
    const maxPosition = await this.taskRepo
      .createQueryBuilder('task')
      .select('MAX(task.position)', 'max')
      .where('task.columnId = :columnId', { columnId: dto.columnId })
      .getRawOne();

    const nextPosition = ((parseFloat(maxPosition?.max) || 0) + 1).toFixed(3);

    const { assigneeIds, labelIds, ...taskData } = dto;

    const task = this.taskRepo.create({
      ...taskData,
      position: nextPosition,
      createdBy: creatorId,
      assignees: assigneeIds
        ? await this.userRepo.find({ where: { id: In(assigneeIds) } })
        : [],
      labels: labelIds
        ? await this.labelRepo.find({ where: { id: In(labelIds) } })
        : [],
    });

    return this.taskRepo.save(task);
  }

  async update(id: string, dto: UpdateTaskDto) {
    const task = await this.taskRepo.findOne({ where: { id } });
    if (!task) throw new NotFoundException('Task không tồn tại');

    Object.assign(task, dto);
    return this.taskRepo.save(task);
  }

  async remove(id: string) {
    const task = await this.taskRepo.findOne({ where: { id } });
    if (!task) throw new NotFoundException('Task không tồn tại');
    await this.taskRepo.remove(task);
    return { message: 'Đã xóa task thành công' };
  }

  async assignUsers(taskId: string, dto: AssignUsersDto) {
    const task = await this.taskRepo.findOne({
      where: { id: taskId },
      relations: ['assignees'],
    });
    if (!task) throw new NotFoundException('Task không tồn tại');

    const newUsers = await this.userRepo.find({
      where: { id: In(dto.userIds) },
    });

    const merged = [
      ...task.assignees,
      ...newUsers.filter(
        (u) => !task.assignees.some((existing) => existing.id === u.id),
      ),
    ];

    task.assignees = merged;

    return await this.taskRepo.save(task);
  }

  async updatePosition(taskId, prevTaskId?, nextTaskId?, newColumnId?) {
    const task = await this.taskRepo.findOne({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task không tồn tại');
  
    if (newColumnId) task.columnId = newColumnId;
  
    const prev = prevTaskId
      ? await this.taskRepo.findOne({ where: { id: prevTaskId } })
      : null;
  
    const next = nextTaskId
      ? await this.taskRepo.findOne({ where: { id: nextTaskId } })
      : null;
  
    if (prev && prev.columnId !== task.columnId) {
      throw new BadRequestException('prevTaskId không hợp lệ (khác column)');
    }
  
    if (next && next.columnId !== task.columnId) {
      throw new BadRequestException('nextTaskId không hợp lệ (khác column)');
    }
  
    let newPosition: number;
  
    const prevPos = prev ? parseFloat(prev.position) : null;
    const nextPos = next ? parseFloat(next.position) : null;
  
    
    if (prevPos !== null && nextPos !== null) {
      newPosition = (prevPos + nextPos) / 2;
    }
  
    
    else if (prevPos !== null && nextPos === null) {
      newPosition = prevPos + 1;
    }
  
    
    else if (prevPos === null && nextPos !== null) {
      newPosition = nextPos - 1;
      if (newPosition < 1) newPosition = nextPos / 2;
    }
  
    
    else {
      
      newPosition = 1;
    }
  
    task.position = newPosition.toString();
    await this.taskRepo.save(task);
  
    return {
      message: 'Cập nhật vị trí thành công',
      position: task.position,
      columnId: task.columnId,
    };
  }
  
  

  async addSubTask(taskId: string, title: string) {
    const task = await this.taskRepo.findOne({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task không tồn tại');

    const sub = this.subRepo.create({ title, task });
    return this.subRepo.save(sub);
  }

  async updateSubTask(id: string, update: Partial<SubTask>) {
    const sub = await this.subRepo.findOne({
      where: { id },
      relations: ['task', 'task.subtasks'],
    });
    if (!sub) throw new NotFoundException('SubTask không tồn tại');

    Object.assign(sub, update);
    await this.subRepo.save(sub);

    const total = sub.task.subtasks.length;
    const done = sub.task.subtasks.filter((s) => s.completed).length;
    sub.task.progress = total ? (done / total) * 100 : 0;
    return this.taskRepo.save(sub.task);
  }
}
