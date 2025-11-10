import { IsArray, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class AssignUsersDto {
  @ApiProperty({ example: ['123e4567-e89b-12d3-a456-426614174000'] })
  @IsArray()
  @IsUUID('all', { each: true })
  userIds: string[];
}

export class AssignLabelsDto {
  @ApiProperty({ example: ['123e4567-e89b-12d3-a456-426614174000'] })
  @IsArray()
  @IsUUID('all', { each: true })
  labelIds: string[];
}
