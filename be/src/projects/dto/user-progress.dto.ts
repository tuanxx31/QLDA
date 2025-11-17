import { ApiProperty } from '@nestjs/swagger';

export class UserProgressDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  userId: string;

  @ApiProperty({ example: 'https://cdn-icons-png.flaticon.com/512/149/149071.png' })
  avatar: string;

  @ApiProperty({ example: 'Nguyễn Văn A' })
  name: string;

  @ApiProperty({ example: 15 })
  totalTasks: number;

  @ApiProperty({ example: 8 })
  doneTasks: number;

  @ApiProperty({ example: 7 })
  todoTasks: number;

  @ApiProperty({ example: 53.33 })
  progress: number;
}

