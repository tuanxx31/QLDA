import { ApiProperty } from '@nestjs/swagger';

export class MemberStatisticsDto {
  @ApiProperty({ example: 'uuid-here', description: 'ID của thành viên' })
  userId: string;

  @ApiProperty({ example: 'Nguyễn Văn A', description: 'Tên thành viên' })
  name: string;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', description: 'Avatar URL' })
  avatar: string;

  @ApiProperty({ example: 15, description: 'Tổng số nhiệm vụ được giao' })
  totalTasks: number;

  @ApiProperty({ example: 10, description: 'Số nhiệm vụ đã hoàn thành' })
  doneTasks: number;

  @ApiProperty({ example: 5, description: 'Số nhiệm vụ chưa hoàn thành' })
  todoTasks: number;

  @ApiProperty({ example: 2, description: 'Số nhiệm vụ quá hạn' })
  overdueTasks: number;

  @ApiProperty({ example: 66.67, description: 'Tỷ lệ hoàn thành (%)' })
  completionRate: number;
}

