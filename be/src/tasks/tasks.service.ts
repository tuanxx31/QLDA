import { Injectable, NotFoundException } from '@nestjs/common';
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

  // 🟢 Lấy tất cả task theo cột
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
  
  

  // 🟢 Cập nhật task
  async update(id: string, dto: UpdateTaskDto) {
    const task = await this.taskRepo.findOne({ where: { id } });
    if (!task) throw new NotFoundException('Task không tồn tại');

    Object.assign(task, dto);
    return this.taskRepo.save(task);
  }

  // 🟢 Xóa task
  async remove(id: string) {
    const task = await this.taskRepo.findOne({ where: { id } });
    if (!task) throw new NotFoundException('Task không tồn tại');
    await this.taskRepo.remove(task);
    return { message: 'Đã xóa task thành công' };
  }

  // 🟢 Gán người làm
  async assignUsers(taskId: string, dto: AssignUsersDto) {
    const task = await this.taskRepo.findOne({
      where: { id: taskId },
      relations: ['assignees'],
    });
    if (!task) throw new NotFoundException('Task không tồn tại');

    task.assignees = await this.userRepo.find({
      where: { id: In(dto.userIds) },
    });
    return this.taskRepo.save(task);
  }

  // 🟢 Gán nhãn
  async assignLabels(taskId: string, dto: AssignLabelsDto) {
    const task = await this.taskRepo.findOne({
      where: { id: taskId },
      relations: ['labels'],
    });
    if (!task) throw new NotFoundException('Task không tồn tại');

    task.labels = await this.labelRepo.find({
      where: { id: In(dto.labelIds) },
    });
    return this.taskRepo.save(task);
  }

  async updatePosition(
    taskId: string,
    prevTaskId?: string,
    nextTaskId?: string,
    newColumnId?: string,
  ) {
    const task = await this.taskRepo.findOne({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task không tồn tại');
  
    // Nếu đổi cột → cập nhật
    if (newColumnId) {
      task.columnId = newColumnId;
    }
  
    // Lấy 2 task lân cận trong cùng cột (sau khi đổi)
    let prev: Task | null = null;
    let next: Task | null = null;
  
    if (prevTaskId) {
      prev = await this.taskRepo.findOne({ where: { id: prevTaskId } });
    }
    if (nextTaskId) {
      next = await this.taskRepo.findOne({ where: { id: nextTaskId } });
    }
  
    let newPosition: number;
  
    if (prev && next) {
      // Giữa 2 task
      newPosition = (parseFloat(prev.position) + parseFloat(next.position)) / 2;
    } else if (prev) {
      // Sau prev (ở cuối)
      newPosition = parseFloat(prev.position) + 1;
    } else if (next) {
      // Trước next (ở đầu)
      newPosition = parseFloat(next.position) / 2;
    } else {
      // Cột trống
      newPosition = 1;
    }
  
    task.position = newPosition.toFixed(3);
    await this.taskRepo.save(task);
  
    return {
      message: 'Cập nhật vị trí thành công',
      position: task.position,
      columnId: task.columnId,
    };
  }
  
  

  // 🟢 Thêm subtask
  async addSubTask(taskId: string, title: string) {
    const task = await this.taskRepo.findOne({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task không tồn tại');

    const sub = this.subRepo.create({ title, task });
    return this.subRepo.save(sub);
  }

  // 🟢 Cập nhật subtask
  async updateSubTask(id: string, update: Partial<SubTask>) {
    const sub = await this.subRepo.findOne({
      where: { id },
      relations: ['task', 'task.subtasks'],
    });
    if (!sub) throw new NotFoundException('SubTask không tồn tại');

    Object.assign(sub, update);
    await this.subRepo.save(sub);

    // Tự động tính lại progress task
    const total = sub.task.subtasks.length;
    const done = sub.task.subtasks.filter((s) => s.completed).length;
    sub.task.progress = total ? (done / total) * 100 : 0;
    return this.taskRepo.save(sub.task);
  }
}
