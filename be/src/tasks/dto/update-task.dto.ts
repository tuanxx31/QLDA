import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';
import { IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @ApiProperty({ example: 'todo' })
  @IsOptional()
  @IsEnum(['todo', 'done'])
  status?: 'todo' | 'done';

  @ApiProperty({ example: '2025-01-01' })
  @IsOptional()
  @IsDateString()
  completedAt?: string;
}
