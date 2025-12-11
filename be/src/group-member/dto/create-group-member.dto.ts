import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsEnum } from 'class-validator';

export class CreateGroupMemberDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  
  @IsNotEmpty()
  groupId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: 'leader' })
  @IsEnum(['leader', 'member'])
  @IsNotEmpty()
  role: 'leader' | 'member';
}
