import { ApiProperty } from '@nestjs/swagger';

export class ProjectProgressDto {
  @ApiProperty({ example: 100 })
  totalTasks: number;

  @ApiProperty({ example: 45 })
  doneTasks: number;

  @ApiProperty({ example: 55 })
  todoTasks: number;

  @ApiProperty({ example: 45.0 })
  progress: number;
}

