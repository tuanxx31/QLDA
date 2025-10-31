import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateProjectDto } from './create-project.dto';
import { IsOptional, IsUUID } from 'class-validator';

export class UpdateProjectDto extends PartialType(CreateProjectDto) {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsOptional()
  @IsUUID()
  groupId?: string;
  group: {
    id: string;
  } | null;
}
