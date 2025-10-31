import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { ColumnsService } from './columns.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('projects/:projectId/columns')
@UseGuards(AuthGuard)
export class ColumnsController {
  constructor(private readonly columnsService: ColumnsService) {}

  @Post()
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Tạo cột mới' })
  @ApiResponse({ status: 201, description: 'Cột đã được tạo thành công' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(
    @Param('projectId') projectId: string,
    @Body() dto: CreateColumnDto,
    @CurrentUser('sub') userId: string,
  ) {
    console.log({userId});
    return this.columnsService.create(projectId, dto, userId);
  }

  @Get()
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Lấy tất cả cột của dự án' })
  @ApiResponse({ status: 200, description: 'Cột đã được lấy thành công' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@Param('projectId') projectId: string) {
    return this.columnsService.findAll(projectId);
  }

  @Patch(':id')
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Cập nhật cột' })
  @ApiResponse({ status: 200, description: 'Cột đã được cập nhật thành công' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  update(@Param('id') id: string, @Body() dto: UpdateColumnDto) {
    return this.columnsService.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Xóa cột' })
  @ApiResponse({ status: 200, description: 'Cột đã được xóa thành công' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  remove(@Param('id') id: string) {
    return this.columnsService.remove(id);
  }
}
