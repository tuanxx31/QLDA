import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class InviteMemberDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  // @IsUUID()()
  @IsNotEmpty()
  groupId: string;

  @IsOptional()
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  // @IsUUID()()
  userId?: string;

  @IsOptional()
  @ApiProperty({ example: 'user@example.com' })
  @IsString()
  email?: string;
}
