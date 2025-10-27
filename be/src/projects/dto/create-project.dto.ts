import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsUUID, IsEnum } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ example: 'Tên dự án' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Mô tả dự án' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '2025-01-01' })
  @IsOptional()
  @IsDateString()
  deadline?: string;

  @ApiProperty({ example: 'todo' })
  @IsOptional()
  @IsEnum(['todo', 'doing', 'done'])
  status?: 'todo' | 'doing' | 'done';

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsOptional()
  @IsUUID()
  groupId?: string;
}
