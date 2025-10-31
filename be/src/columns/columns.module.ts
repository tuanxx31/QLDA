import { Module } from '@nestjs/common';
import { ColumnsService } from './columns.service';
import { ColumnsController } from './columns.controller';
import { ColumnEntity } from './entities/column.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from 'src/projects/entities/project.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ColumnEntity, Project])],
  controllers: [ColumnsController],
  providers: [ColumnsService],
})
export class ColumnsModule {}
