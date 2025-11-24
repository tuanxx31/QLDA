import { PartialType } from '@nestjs/swagger';
import { CreateProjectDto } from './create-project.dto';
import { IsOptional } from 'class-validator';
import { Group } from 'src/groups/entities/group.entity';

export class UpdateProjectDto extends PartialType(CreateProjectDto) {
  @IsOptional()
  group?: Group | null;
}
