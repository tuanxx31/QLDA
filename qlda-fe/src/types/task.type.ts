import type { User } from './user.type';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: string; // thời gian hoàn thành (ISO)
  position?: number; // vị trí trong task
  taskId?: string; // tham chiếu tới task cha
}

export interface Label {
  id: string;
  name: string;
  color: string;
  description?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'done';
  priority: 'low' | 'medium' | 'high';

  startDate?: string; // ISO timestamp
  dueDate?: string;
  completedAt?: string;

  progress?: number; // % hoàn thành
  position?: number; // thứ tự trong cột
  columnId: string; // cột chứa task
  createdBy?: string; // người tạo

  // Quan hệ
  assignees?: User[];
  labels?: Label[];
  subtasks?: SubTask[];

  // Metadata
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  status?: 'todo' | 'done';
  priority?: 'low' | 'medium' | 'high';
  startDate?: string;
  dueDate?: string;
  completedAt?: string;
  progress?: number;
  position?: number;
  columnId: string;
}

export interface UpdateTaskDto extends Partial<CreateTaskDto> {
    status?: 'todo' | 'done';
    completedAt?: string;
}

export interface AssignUsersDto {
    userIds: string[];
    labelIds: string[];
}