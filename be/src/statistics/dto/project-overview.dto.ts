import { ApiProperty } from '@nestjs/swagger';

export class ProjectOverviewDto {
  @ApiProperty({ example: 5, description: 'Tổng số cột' })
  totalColumns: number;

  @ApiProperty({ example: 50, description: 'Tổng số nhiệm vụ' })
  totalTasks: number;

  @ApiProperty({ example: 30, description: 'Số nhiệm vụ đã hoàn thành' })
  doneTasks: number;

  @ApiProperty({ example: 20, description: 'Số nhiệm vụ chưa hoàn thành' })
  todoTasks: number;

  @ApiProperty({ example: 5, description: 'Số nhiệm vụ quá hạn' })
  overdueTasks: number;
}

