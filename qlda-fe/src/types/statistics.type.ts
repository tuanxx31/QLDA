export interface ProjectOverview {
  totalColumns: number;
  totalTasks: number;
  doneTasks: number;
  todoTasks: number;
  overdueTasks: number;
}

export interface ColumnStatistics {
  columnId: string;
  columnName: string;
  totalTasks: number;
  doneTasks: number;
  todoTasks: number;
  progress: number;
}

export interface MemberStatistics {
  userId: string;
  name: string;
  avatar: string;
  totalTasks: number;
  doneTasks: number;
  todoTasks: number;
  overdueTasks: number;
  completionRate: number;
}

export interface TimelineStatistics {
  date: string;
  createdTasks: number;
  completedTasks: number;
  onTimeTasks: number;
  lateTasks: number;
}

export interface CommentByTask {
  taskId: string;
  taskTitle: string;
  commentCount: number;
}

export interface CommentByMember {
  userId: string;
  userName: string;
  avatar: string;
  commentCount: number;
}

export interface CommentStatistics {
  totalComments: number;
  recentComments: number;
  commentsByTask: CommentByTask[];
  commentsByMember: CommentByMember[];
}

export interface TaskDeadline {
  taskId: string;
  taskTitle: string;
  dueDate: string;
  status: string;
  completedAt?: string | null;
}

export interface DeadlineAnalytics {
  overdueTasks: number;
  dueSoonTasks: number;
  completedOnTime: number;
  completedLate: number;
  overdueTasksList: TaskDeadline[];
  dueSoonTasksList: TaskDeadline[];
  completedOnTimeList: TaskDeadline[];
  completedLateList: TaskDeadline[];
}

