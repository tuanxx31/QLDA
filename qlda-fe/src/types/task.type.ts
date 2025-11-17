import type { User } from './user.type';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: string; 
  position?: number; 
  taskId?: string; 
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

  startDate?: string; 
  dueDate?: string;
  completedAt?: string;

  progress?: number; 
  position?: number; 
  columnId: string; 
  createdBy?: string; 

  
  assignees?: User[];
  labels?: Label[];
  subtasks?: SubTask[];

  
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