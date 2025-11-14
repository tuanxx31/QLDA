import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Task } from './entities/task.entity';
import { Label } from 'src/labels/entities/label.entity';
import { User } from 'src/users/entities/user.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AssignUsersDto, AssignLabelsDto } from './dto/assign.dto';
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
    const task = await this.taskRepo.findOne({ where: { id }, relations: ['assignees'] });
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
  
    const task = this.taskRepo.create({
      ...dto,
      position: nextPosition,
      createdBy: creatorId,
      assignees: dto.assigneeIds
        ? await this.userRepo.find({ where: { id: In(dto.assigneeIds) } })
        : [],
      labels: dto.labelIds
        ? await this.labelRepo.find({ where: { id: In(dto.labelIds) } })
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
  
    const newUsers = await this.userRepo.find({ where: { id: In(dto.userIds) } });
  
    const merged = [
      ...task.assignees,
      ...newUsers.filter(
        (u) => !task.assignees.some((existing) => existing.id === u.id),
      ),
    ];
  
    task.assignees = merged;
  
    return await this.taskRepo.save(task);
  }

  async updatePosition(
    taskId: string,
    prevTaskId?: string,
    nextTaskId?: string,
    newColumnId?: string,
  ) {
    const task = await this.taskRepo.findOne({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task không tồn tại');
  
    // Nếu đổi cột → cập nhật columnId ngay
    if (newColumnId) {
      task.columnId = newColumnId;
    }
  
    // Lấy prev/next
    const prev = prevTaskId
      ? await this.taskRepo.findOne({ where: { id: prevTaskId } })
      : null;
  
    const next = nextTaskId
      ? await this.taskRepo.findOne({ where: { id: nextTaskId } })
      : null;
  
    // ============= VALIDATE =============
    // Nếu prev nằm cột khác → bỏ qua
    if (prev && prev.columnId !== task.columnId) {
      throw new BadRequestException('prevTaskId không hợp lệ (khác column)');
    }
  
    // Nếu next nằm cột khác → bỏ qua
    if (next && next.columnId !== task.columnId) {
      throw new BadRequestException('nextTaskId không hợp lệ (khác column)');
    }
  
    let newPosition = 0;
    const gap = 1000; // offset lớn để hạn chế rebalance
  
    const prevPos = prev ? parseFloat(prev.position) : null;
    const nextPos = next ? parseFloat(next.position) : null;
  
    // ============= CASE 1: Giữa 2 task =============
    if (prevPos !== null && nextPos !== null) {
      newPosition = (prevPos + nextPos) / 2;
    }
  
    // ============= CASE 2: Cuối list (không có next) =============
    else if (prevPos !== null && nextPos === null) {
      newPosition = prevPos + gap;
    }
  
    // ============= CASE 3: Đầu list (không có prev) =============
    else if (prevPos === null && nextPos !== null) {
      newPosition = nextPos - gap;
  
      // Nếu bị âm → đẩy về 0
      if (newPosition < 0) newPosition = 0;
    }
  
    // ============= CASE 4: Column rỗng (không prev, không next) =============
    else {
      newPosition = gap;
    }
  
    // GÁN GIÁ TRỊ (TypeORM tự convert number → decimal string)
    task.position = String(newPosition);
  
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
