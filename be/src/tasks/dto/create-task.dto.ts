import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsDate } from 'class-validator';
import { IsEnum } from 'class-validator';

export class CreateTaskDto {
    @ApiProperty({ example: 'Tên task' })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({ example: 'Mô tả task' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ example: '2025-01-01' })
    @IsOptional()
    @IsDate()
    startDate?: Date;

    @ApiProperty({ example: '2025-01-01' })
    @IsOptional()
    @IsDate()
    dueDate?: Date;

    @ApiProperty({ example: 'todo' })
    @IsOptional()
    @IsEnum(['todo', 'doing', 'done'])
    status?: 'todo' | 'doing' | 'done';

    @ApiProperty({ example: 'low' })
    @IsOptional()
    @IsEnum(['low', 'medium', 'high'])
    priority?: 'low' | 'medium' | 'high';
  }