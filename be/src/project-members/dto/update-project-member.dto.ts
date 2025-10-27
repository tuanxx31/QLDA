import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class UpdateProjectMemberDto {
  @ApiProperty({ example: 'leader' })
  @IsEnum(['leader', 'editor', 'viewer'])
  role: 'leader' | 'editor' | 'viewer';
}
