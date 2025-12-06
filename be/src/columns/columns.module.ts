import { Module } from '@nestjs/common';
import { ColumnsService } from './columns.service';
import { ColumnsController } from './columns.controller';
import { ColumnEntity } from './entities/column.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from 'src/projects/entities/project.entity';
import { PermissionsModule } from 'src/permissions/permissions.module';
import { ProjectMember } from 'src/project-members/entities/project-member.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ColumnEntity, Project, ProjectMember]),
    PermissionsModule,
  ],
  controllers: [ColumnsController],
  providers: [ColumnsService],
})
export class ColumnsModule {}
