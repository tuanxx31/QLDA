import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Task } from './entities/task.entity';
import { Label } from 'src/labels/entities/label.entity';
import { User } from 'src/users/entities/user.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AssignUsersDto, AssignLabelsDto, UnassignUsersDto } from './dto/assign.dto';
import { SubTask } from 'src/sub-tasks/entities/sub-task.entity';
import { PermissionsService } from 'src/permissions/permissions.service';
import { ColumnEntity } from 'src/columns/entities/column.entity';
import { ProjectMember } from 'src/project-members/entities/project-member.entity';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task) private taskRepo: Repository<Task>,
    @InjectRepository(SubTask) private subRepo: Repository<SubTask>,
    @InjectRepository(Label) private labelRepo: Repository<Label>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(ColumnEntity) private columnRepo: Repository<ColumnEntity>,
    @InjectRepository(ProjectMember) private projectMemberRepo: Repository<ProjectMember>,
    private permissionsService: PermissionsService,
  ) {}

  async findOne(id: string) {
    const task = await this.taskRepo.findOne({
      where: { id },
      relations: ['assignees', 'labels', 'subtasks', 'column', 'column.project'],
    });
    if (!task) throw new NotFoundException('Task không tồn tại');

    // Filter assignees theo project members nếu có project
    if (task.column?.project?.id) {
      const projectMembers = await this.projectMemberRepo.find({
        where: { project: { id: task.column.project.id } },
        relations: ['user'],
      });

      const projectMemberUserIds = new Set(
        projectMembers.map((pm) => pm.user.id),
      );

      task.assignees = task.assignees.filter((assignee) =>
        projectMemberUserIds.has(assignee.id),
      );
    }

    return task;
  }

  async getAssignees(id: string) {
    const task = await this.taskRepo.findOne({
      where: { id },
      relations: ['assignees', 'column', 'column.project'],
    });
    if (!task) throw new NotFoundException('Task không tồn tại');

    // Nếu không có project, trả về tất cả assignees
    if (!task.column?.project?.id) {
      return task.assignees;
    }

    // Lấy danh sách project members
    const projectMembers = await this.projectMemberRepo.find({
      where: { project: { id: task.column.project.id } },
      relations: ['user'],
    });

    // Tạo Set các userIds còn trong project
    const projectMemberUserIds = new Set(
      projectMembers.map((pm) => pm.user.id),
    );

    // Filter assignees chỉ giữ những người còn trong project members
    const filteredAssignees = task.assignees.filter((assignee) =>
      projectMemberUserIds.has(assignee.id),
    );

    return filteredAssignees;
  }

  async findByColumn(columnId: string) {
    const column = await this.columnRepo.findOne({
      where: { id: columnId },
      relations: ['project'],
    });

    const tasks = await this.taskRepo.find({
      where: { columnId },
      relations: ['assignees', 'labels', 'subtasks'],
      order: { position: 'ASC' },
    });

    // Filter assignees theo project members nếu có project
    if (column?.project?.id) {
      const projectMembers = await this.projectMemberRepo.find({
        where: { project: { id: column.project.id } },
        relations: ['user'],
      });

      const projectMemberUserIds = new Set(
        projectMembers.map((pm) => pm.user.id),
      );

      tasks.forEach((task) => {
        task.assignees = task.assignees.filter((assignee) =>
          projectMemberUserIds.has(assignee.id),
        );
      });
    }

    return tasks;
  }

  async create(dto: CreateTaskDto, creatorId: string) {
    // Lấy column để kiểm tra projectId
    const column = await this.columnRepo.findOne({
      where: { id: dto.columnId },
      relations: ['project'],
    });

    if (!column) {
      throw new NotFoundException('Không tìm thấy cột.');
    }

    // Kiểm tra quyền tạo task
    const canEdit = await this.permissionsService.canEditTask(
      column.project.id,
      creatorId,
    );
    if (!canEdit) {
      throw new ForbiddenException('Không có quyền tạo task.');
    }

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

    const saved = await this.taskRepo.save(task);
    
    
    return this.taskRepo.findOne({
      where: { id: saved.id },
      relations: ['assignees', 'labels', 'subtasks'],
    });
  }

  async update(id: string, dto: UpdateTaskDto, userId?: string) {
    const task = await this.taskRepo.findOne({ 
      where: { id },
      relations: ['assignees', 'labels', 'subtasks', 'column', 'column.project'],
    });
    if (!task) throw new NotFoundException('Task không tồn tại');

    // Kiểm tra quyền nếu có userId
    if (userId) {
      const canEdit = await this.permissionsService.canEditTask(
        task.column.project.id,
        userId,
      );
      if (!canEdit) {
        throw new ForbiddenException('Không có quyền cập nhật task.');
      }
    }

    Object.assign(task, dto);
    const saved = await this.taskRepo.save(task);
    
    
    return this.taskRepo.findOne({
      where: { id: saved.id },
      relations: ['assignees', 'labels', 'subtasks'],
    });
  }

  async remove(id: string, userId?: string) {
    const task = await this.taskRepo.findOne({
      where: { id },
      relations: ['column', 'column.project'],
    });
    if (!task) throw new NotFoundException('Task không tồn tại');

    // Kiểm tra quyền nếu có userId
    if (userId) {
      const canDelete = await this.permissionsService.canDeleteTask(
        task.column.project.id,
        userId,
      );
      if (!canDelete) {
        throw new ForbiddenException('Không có quyền xóa task.');
      }
    }

    await this.taskRepo.remove(task);
    return { message: 'Đã xóa task thành công' };
  }

  async assignUsers(taskId: string, dto: AssignUsersDto, userId?: string) {
    const task = await this.taskRepo.findOne({
      where: { id: taskId },
      relations: ['assignees', 'labels', 'subtasks', 'column', 'column.project'],
    });
    if (!task) throw new NotFoundException('Task không tồn tại');

    // Kiểm tra quyền nếu có userId
    if (userId) {
      const canEdit = await this.permissionsService.canEditTask(
        task.column.project.id,
        userId,
      );
      if (!canEdit) {
        throw new ForbiddenException('Không có quyền gán người làm task.');
      }
    }

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
    await this.taskRepo.save(task);
    
    
    return this.taskRepo.findOne({
      where: { id: taskId },
      relations: ['assignees', 'labels', 'subtasks'],
    });
  }

  async unassignUsers(taskId: string, dto: UnassignUsersDto, userId?: string) {
    const task = await this.taskRepo.findOne({
      where: { id: taskId },
      relations: ['assignees', 'labels', 'subtasks', 'column', 'column.project'],
    });
    if (!task) throw new NotFoundException('Task không tồn tại');

    // Kiểm tra quyền nếu có userId
    if (userId) {
      const canEdit = await this.permissionsService.canEditTask(
        task.column.project.id,
        userId,
      );
      if (!canEdit) {
        throw new ForbiddenException('Không có quyền hủy gán người làm task.');
      }
    }

    // Filter bỏ các assignees có id trong dto.userIds
    task.assignees = task.assignees.filter(
      (assignee) => !dto.userIds.includes(assignee.id),
    );

    await this.taskRepo.save(task);

    return this.taskRepo.findOne({
      where: { id: taskId },
      relations: ['assignees', 'labels', 'subtasks'],
    });
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
      relations: ['task', 'task.subtasks', 'task.assignees', 'task.labels'],
    });
    if (!sub) throw new NotFoundException('SubTask không tồn tại');

    Object.assign(sub, update);
    await this.subRepo.save(sub);

    const total = sub.task.subtasks.length;
    const done = sub.task.subtasks.filter((s) => s.completed).length;
    sub.task.progress = total ? (done / total) * 100 : 0;
    await this.taskRepo.save(sub.task);
    
    
    return this.taskRepo.findOne({
      where: { id: sub.task.id },
      relations: ['assignees', 'labels', 'subtasks'],
    });
  }

  async updateStatus(id: string, status: 'todo'| 'done', userId?: string) {
    const task = await this.taskRepo.findOne({ 
      where: { id },
      relations: ['assignees', 'labels', 'subtasks', 'column', 'column.project'],
    });
    if (!task) throw new NotFoundException('Task không tồn tại');

    // Kiểm tra quyền nếu có userId
    if (userId) {
      const assigneeIds = task.assignees.map((a) => a.id);
      const canUpdate = await this.permissionsService.canUpdateTaskStatus(
        task.column.project.id,
        userId,
        assigneeIds,
      );
      if (!canUpdate) {
        throw new ForbiddenException('Không có quyền cập nhật trạng thái task.');
      }
    }

    task.status = status;
    task.completedAt = status === 'done' ? new Date() : undefined as unknown as Date;
    await this.taskRepo.save(task);
    
    
    const updated = await this.taskRepo.findOne({
      where: { id },
      relations: ['assignees', 'labels', 'subtasks'],
    });
    
    return updated || task;
  }

  async assignLabels(taskId: string, dto: AssignLabelsDto, userId?: string) {
    const task = await this.taskRepo.findOne({
      where: { id: taskId },
      relations: ['assignees', 'labels', 'subtasks', 'column', 'column.project'],
    });
    if (!task) throw new NotFoundException('Task không tồn tại');

    // Kiểm tra quyền nếu có userId
    if (userId) {
      const canEdit = await this.permissionsService.canEditTask(
        task.column.project.id,
        userId,
      );
      if (!canEdit) {
        throw new ForbiddenException('Không có quyền gán nhãn task.');
      }
    }

    const newLabels = await this.labelRepo.find({
      where: { id: In(dto.labelIds) },
    });

    const merged = [
      ...task.labels,
      ...newLabels.filter(
        (l) => !task.labels.some((existing) => existing.id === l.id),
      ),
    ];

    task.labels = merged;
    await this.taskRepo.save(task);
    
    
    return this.taskRepo.findOne({
      where: { id: taskId },
      relations: ['assignees', 'labels', 'subtasks'],
    });
  }

  async unassignLabels(taskId: string, dto: AssignLabelsDto, userId?: string) {
    const task = await this.taskRepo.findOne({
      where: { id: taskId },
      relations: ['assignees', 'labels', 'subtasks', 'column', 'column.project'],
    });
    if (!task) throw new NotFoundException('Task không tồn tại');

    // Kiểm tra quyền nếu có userId
    if (userId) {
      const canEdit = await this.permissionsService.canEditTask(
        task.column.project.id,
        userId,
      );
      if (!canEdit) {
        throw new ForbiddenException('Không có quyền bỏ gán nhãn task.');
      }
    }

    task.labels = task.labels.filter(
      (l) => !dto.labelIds.includes(l.id),
    );

    await this.taskRepo.save(task);
    
    
    return this.taskRepo.findOne({
      where: { id: taskId },
      relations: ['assignees', 'labels', 'subtasks'],
    });
  }

}
