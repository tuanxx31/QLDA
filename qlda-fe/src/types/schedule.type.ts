import type { Label } from './task.type';
import type { User } from './user.type';

export interface ScheduleTask {
  id: string;
  title: string;
  description?: string;
  startDate?: string | null;
  dueDate?: string | null;
  status: 'todo' | 'done';
  priority: 'low' | 'medium' | 'high';
  progress?: number;
  projectId?: string;
  projectName?: string;
  columnName?: string;
  labels?: Label[];
  assignees?: User[];
}

export interface CalendarEvent {
  date: string; // YYYY-MM-DD format
  tasks: ScheduleTask[];
}
