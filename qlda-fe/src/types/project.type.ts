import type { User } from './user.type';
import type { Group } from './group.type';

export interface Project {
  id: string;
  name: string;
  description?: string;
  startDate?: string | null;
  status: 'todo' | 'doing' | 'done';
  deadline?: string | null;
  owner: User;
  group?: Group | null;
  manager?: User;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectDto {
  name: string;
  description?: string;
  startDate?: string;
  deadline?: string;
  status?: 'todo' | 'doing' | 'done';
  group?: {
    id: string;
  } | null;
}

export interface UpdateProjectDto extends Partial<CreateProjectDto> {
  id: string;
  group?: {
    id: string;
  } | null;
}

export interface ProjectMember {
  id: string;
  user: User;
  role: 'leader' | 'editor' | 'viewer';
  joinedAt: string;
}

export interface CreateProjectMemberDto {
  email: string;
  role: 'viewer' | 'editor' | 'leader';
}

export interface ProjectProgress {
  totalTasks: number;
  doneTasks: number;
  todoTasks: number;
  progress: number;
}

export interface ColumnProgress {
  columnId: string;
  columnName: string;
  totalTasks: number;
  doneTasks: number;
  todoTasks: number;
  progress: number;
}

export interface UserProgress {
  userId: string;
  avatar: string;
  name: string;
  totalTasks: number;
  doneTasks: number;
  todoTasks: number;
  progress: number;
}

export interface DeadlineSummary {
  overdue: number;
  dueSoon: number;
  completedOnTime: number;
  completedLate: number;
}