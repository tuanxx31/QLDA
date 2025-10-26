import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateGroupDto {
  @ApiProperty({ example: 'Nhóm 1' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'Mô tả nhóm' })
  @IsOptional()
  @IsString()
  description?: string;
}
