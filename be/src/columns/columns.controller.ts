import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { ColumnsService } from './columns.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { CurrentUser } from 'src/auth/current-user.decorator';

@Controller('projects/:projectId/columns')
export class ColumnsController {
  constructor(private readonly columnsService: ColumnsService) {}

  @Post()
  create(
    @Param('projectId') projectId: string,
    @Body() dto: CreateColumnDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.columnsService.create(projectId, dto, userId);
  }

  @Get()
  findAll(@Param('projectId') projectId: string) {
    return this.columnsService.findAll(projectId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateColumnDto) {
    return this.columnsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.columnsService.remove(id);
  }
}
