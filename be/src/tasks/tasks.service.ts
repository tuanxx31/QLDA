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
  
  async getAssignees(id: string) {
    const task = await this.taskRepo.findOne({ where: { id }, relations: ['assignees'] });
    if (!task) throw new NotFoundException('Task không tồn tại');
    return task.assignees;
  }

  // 🟢 Lấy tất cả task theo cột
  async findByColumn(columnId: string) {
    return this.taskRepo.find({
      where: { columnId },
      relations: ['assignees', 'labels', 'subtasks'],
      order: { position: 'ASC' },
    });
  }

  // 🟢 Tạo task mới
  async create(dto: CreateTaskDto, creatorId: string) {
    const task = this.taskRepo.create({
      ...dto,
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
  
    // 🟩 Lấy toàn bộ user mới muốn thêm
    const newUsers = await this.userRepo.find({ where: { id: In(dto.userIds) } });
  
    // 🟩 Hợp nhất danh sách assignees cũ + mới, tránh trùng
    const merged = [
      ...task.assignees,
      ...newUsers.filter(
        (u) => !task.assignees.some((existing) => existing.id === u.id),
      ),
    ];
  
    task.assignees = merged;
  
    // 🟩 Lưu lại task
    return await this.taskRepo.save(task);
  }
  

  // 🟢 Gán nhãn
  async assignLabels(taskId: string, dto: AssignLabelsDto) {
    const task = await this.taskRepo.findOne({
      where: { id: taskId },
      relations: ['labels'],
    });
    if (!task) throw new NotFoundException('Task không tồn tại');

    task.labels = await this.labelRepo.find({ where: { id: In(dto.labelIds) } });
    return this.taskRepo.save(task);
  }

  // 🟢 Cập nhật vị trí (drag-drop)
  async updatePosition(taskId: string, newPosition: number, newColumnId?: string) {
    const task = await this.taskRepo.findOne({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task không tồn tại');

    if (newColumnId) task.columnId = newColumnId;
    task.position = String(newPosition);
    return this.taskRepo.save(task);
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
    const sub = await this.subRepo.findOne({ where: { id }, relations: ['task', 'task.subtasks'] });
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
