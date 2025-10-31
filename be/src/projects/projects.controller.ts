import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@ApiTags('Projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Tạo dự án mới (cá nhân hoặc thuộc nhóm)' })
  @ApiResponse({ status: 201, description: 'Dự án được tạo thành công' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Body() dto: CreateProjectDto, @Request() req: any) {
    return await this.projectsService.create(dto, req.user.sub as string);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth('jwt')
  @ApiOperation({
    summary:
      'Lấy danh sách tất cả dự án mà người dùng tham gia (bao gồm cá nhân + nhóm)',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách dự án được lấy thành công',
  })
  async findAllByUser(@Request() req: any) {
    return await this.projectsService.findAllByUser(req.user.sub as string);
  }

  @Get('group/:groupId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Lấy danh sách dự án theo nhóm' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách dự án theo nhóm được lấy thành công',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy nhóm' })
  async findAllByGroup(@Param('groupId') groupId: string, @Request() req: any) {
    return await this.projectsService.findAllByGroup(
      groupId,
      req.user.sub as string,
    );
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Lấy chi tiết một dự án' })
  @ApiResponse({
    status: 200,
    description: 'Thông tin dự án được lấy thành công',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy dự án' })
  async findOne(@Param('id') id: string) {
    return await this.projectsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('jwt')
  @ApiOperation({
    summary: 'Cập nhật thông tin dự án (chỉ owner hoặc manager)',
  })
  @ApiResponse({ status: 200, description: 'Dự án được cập nhật thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền cập nhật dự án' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
    @Request() req: any,
  ) {
    return await this.projectsService.update(id, dto, req.user.sub as string);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Xóa dự án (chỉ owner hoặc manager)' })
  @ApiResponse({ status: 200, description: 'Dự án được xóa thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền xóa dự án' })
  async remove(@Param('id') id: string, @Request() req: any) {
    return await this.projectsService.remove(id, req.user.sub as string);
  }

  @Patch(':id/convert-to-group/:groupId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Chuyển dự án cá nhân thành dự án nhóm' })
  @ApiResponse({ status: 200, description: 'Chuyển dự án thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy dự án hoặc nhóm' })
  async convertToGroup(
    @Param('id') id: string,
    @Param('groupId') groupId: string,
    @Request() req: any,
  ) {
    return await this.projectsService.convertToGroup(
      id,
      groupId,
      req.user.sub as string,
    );
  }

  @Patch(':id/remove-group')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Tách dự án khỏi nhóm, trở thành dự án cá nhân' })
  @ApiResponse({
    status: 200,
    description: 'Dự án được tách khỏi nhóm thành công',
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền thực hiện thao tác này',
  })
  async removeGroup(@Param('id') id: string, @Request() req: any) {
    return await this.projectsService.removeGroup(id, req.user.sub as string);
  }
}
