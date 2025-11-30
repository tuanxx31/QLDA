import { ApiProperty } from '@nestjs/swagger';

export class ColumnStatisticsDto {
  @ApiProperty({ example: 'uuid-here', description: 'ID của cột' })
  columnId: string;

  @ApiProperty({ example: 'To Do', description: 'Tên cột' })
  columnName: string;

  @ApiProperty({ example: 10, description: 'Tổng số nhiệm vụ trong cột' })
  totalTasks: number;

  @ApiProperty({ example: 5, description: 'Số nhiệm vụ đã hoàn thành' })
  doneTasks: number;

  @ApiProperty({ example: 5, description: 'Số nhiệm vụ chưa hoàn thành' })
  todoTasks: number;

  @ApiProperty({ example: 50.0, description: 'Phần trăm tiến độ' })
  progress: number;
}

