import { ApiProperty } from '@nestjs/swagger';

export class ColumnProgressDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  columnId: string;

  @ApiProperty({ example: 'To Do' })
  columnName: string;

  @ApiProperty({ example: 20 })
  totalTasks: number;

  @ApiProperty({ example: 5 })
  doneTasks: number;

  @ApiProperty({ example: 15 })
  todoTasks: number;

  @ApiProperty({ example: 25.0 })
  progress: number;
}

