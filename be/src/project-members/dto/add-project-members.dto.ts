import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

export class AddProjectMembersDto {
  @ApiProperty({ example: ['user-id-1', 'user-id-2'] })
  @IsNotEmpty()
  @IsArray()
  userIds: string[];

  @ApiProperty({ example: 'viewer', enum: ['viewer', 'editor', 'leader'], required: false })
  @IsOptional()
  @IsEnum(['viewer', 'editor', 'leader'])
  role?: 'viewer' | 'editor' | 'leader';
}

