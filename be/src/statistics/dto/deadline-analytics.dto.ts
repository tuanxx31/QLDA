import { ApiProperty } from '@nestjs/swagger';

export class TaskDeadlineDto {
  @ApiProperty({ example: 'uuid-here', description: 'ID của nhiệm vụ' })
  taskId: string;

  @ApiProperty({ example: 'Task title', description: 'Tiêu đề nhiệm vụ' })
  taskTitle: string;

  @ApiProperty({ example: '2024-01-20T00:00:00Z', description: 'Hạn chót' })
  dueDate: Date;

  @ApiProperty({ example: 'todo', description: 'Trạng thái nhiệm vụ' })
  status: string;

  @ApiProperty({ example: '2024-01-19T00:00:00Z', nullable: true, description: 'Thời gian hoàn thành' })
  completedAt?: Date | null;
}

export class DeadlineAnalyticsDto {
  @ApiProperty({ example: 5, description: 'Số nhiệm vụ quá hạn' })
  overdueTasks: number;

  @ApiProperty({ example: 3, description: 'Số nhiệm vụ sắp đến hạn (3 ngày)' })
  dueSoonTasks: number;

  @ApiProperty({ example: 10, description: 'Số nhiệm vụ hoàn thành đúng hạn' })
  completedOnTime: number;

  @ApiProperty({ example: 2, description: 'Số nhiệm vụ hoàn thành trễ hạn' })
  completedLate: number;

  @ApiProperty({ type: [TaskDeadlineDto], description: 'Danh sách nhiệm vụ quá hạn' })
  overdueTasksList: TaskDeadlineDto[];

  @ApiProperty({ type: [TaskDeadlineDto], description: 'Danh sách nhiệm vụ sắp đến hạn' })
  dueSoonTasksList: TaskDeadlineDto[];

  @ApiProperty({ type: [TaskDeadlineDto], description: 'Danh sách nhiệm vụ hoàn thành đúng hạn' })
  completedOnTimeList: TaskDeadlineDto[];

  @ApiProperty({ type: [TaskDeadlineDto], description: 'Danh sách nhiệm vụ hoàn thành trễ hạn' })
  completedLateList: TaskDeadlineDto[];
}

