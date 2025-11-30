import { ApiProperty } from '@nestjs/swagger';

export class TimelineStatisticsDto {
  @ApiProperty({ example: '2024-01-15', description: 'Ngày thống kê' })
  date: string;

  @ApiProperty({ example: 5, description: 'Số nhiệm vụ được tạo' })
  createdTasks: number;

  @ApiProperty({ example: 3, description: 'Số nhiệm vụ hoàn thành' })
  completedTasks: number;

  @ApiProperty({ example: 2, description: 'Số nhiệm vụ hoàn thành đúng hạn' })
  onTimeTasks: number;

  @ApiProperty({ example: 1, description: 'Số nhiệm vụ hoàn thành trễ hạn' })
  lateTasks: number;
}

