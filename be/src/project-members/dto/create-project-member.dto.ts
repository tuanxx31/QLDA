import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateProjectMemberDto {
  @ApiProperty({ example: 'example@example.com' })
  
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'viewer' })
  @IsOptional()
  @IsEnum(['viewer', 'editor', 'leader'])
  role: 'viewer' | 'editor' | 'leader';
}
