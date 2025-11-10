import { IsString, IsOptional, IsDateString, IsEnum, IsUUID, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({ example: 'Tên task' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Mô tả task' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '2025-01-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ example: '2025-01-01' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiProperty({ example: 'todo' })
  @IsOptional()
  @IsEnum(['todo', 'doing', 'done'])
  status?: 'todo' | 'doing' | 'done';

  @ApiProperty({ example: 'low' })
  @IsOptional()
  @IsEnum(['low', 'medium', 'high'])
  priority?: 'low' | 'medium' | 'high';

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  columnId: string;

  @ApiProperty({ example: ['123e4567-e89b-12d3-a456-426614174000'] })
  @IsOptional()
  @IsArray()
  assigneeIds?: string[];

  @ApiProperty({ example: ['123e4567-e89b-12d3-a456-426614174000'] })
  @IsOptional()
  @IsArray()
  labelIds?: string[];
}
