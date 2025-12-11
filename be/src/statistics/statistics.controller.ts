import { Controller, Get, Param, Query, UseGuards, Request } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { StatisticsService } from './statistics.service';
import { ProjectOverviewDto } from './dto/project-overview.dto';
import { ColumnStatisticsDto } from './dto/column-statistics.dto';
import { MemberStatisticsDto } from './dto/member-statistics.dto';
import { TimelineStatisticsDto } from './dto/timeline-statistics.dto';
import { CommentStatisticsDto } from './dto/comment-statistics.dto';
import { DeadlineAnalyticsDto } from './dto/deadline-analytics.dto';

@ApiTags('Statistics')
@Controller('projects/:projectId/statistics')
@UseGuards(AuthGuard)
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('overview')
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Lấy thống kê tổng quan của dự án' })
  @ApiResponse({
    status: 200,
    description: 'Thống kê tổng quan được lấy thành công',
    type: ProjectOverviewDto,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy dự án' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập dự án' })
  async getProjectOverview(@Param('projectId') projectId: string, @Request() req: any): Promise<ProjectOverviewDto> {
    return this.statisticsService.getProjectOverview(projectId, req.user.sub as string);
  }

  @Get('columns')
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Lấy thống kê theo từng cột' })
  @ApiResponse({
    status: 200,
    description: 'Thống kê theo cột được lấy thành công',
    type: [ColumnStatisticsDto],
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy dự án' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập dự án' })
  async getColumnStatistics(
    @Param('projectId') projectId: string,
    @Request() req: any,
  ): Promise<ColumnStatisticsDto[]> {
    return this.statisticsService.getColumnStatistics(projectId, req.user.sub as string);
  }

  @Get('members')
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Lấy thống kê theo thành viên' })
  @ApiResponse({
    status: 200,
    description: 'Thống kê theo thành viên được lấy thành công',
    type: [MemberStatisticsDto],
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy dự án' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập dự án' })
  async getMemberStatistics(
    @Param('projectId') projectId: string,
    @Request() req: any,
  ): Promise<MemberStatisticsDto[]> {
    return this.statisticsService.getMemberStatistics(projectId, req.user.sub as string);
  }

  @Get('timeline')
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Lấy thống kê theo thời gian' })
  @ApiQuery({
    name: 'period',
    enum: ['day', 'week', 'month'],
    required: false,
    description: 'Chu kỳ thống kê',
  })
  @ApiQuery({
    name: 'startDate',
    type: String,
    required: false,
    description: 'Ngày bắt đầu (ISO string)',
  })
  @ApiQuery({
    name: 'endDate',
    type: String,
    required: false,
    description: 'Ngày kết thúc (ISO string)',
  })
  @ApiResponse({
    status: 200,
    description: 'Thống kê theo thời gian được lấy thành công',
    type: [TimelineStatisticsDto],
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy dự án' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập dự án' })
  async getTimelineStatistics(
    @Param('projectId') projectId: string,
    @Request() req: any,
    @Query('period') period?: 'day' | 'week' | 'month',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<TimelineStatisticsDto[]> {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.statisticsService.getTimelineStatistics(projectId, req.user.sub as string, period || 'day', start, end);
  }

  @Get('comments')
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Lấy thống kê bình luận' })
  @ApiQuery({
    name: 'filter',
    enum: ['24h', '7d', 'all'],
    required: false,
    description: 'Lọc bình luận theo thời gian',
  })
  @ApiResponse({
    status: 200,
    description: 'Thống kê bình luận được lấy thành công',
    type: CommentStatisticsDto,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy dự án' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập dự án' })
  async getCommentStatistics(
    @Param('projectId') projectId: string,
    @Request() req: any,
    @Query('filter') filter?: '24h' | '7d' | 'all',
  ): Promise<CommentStatisticsDto> {
    return this.statisticsService.getCommentStatistics(projectId, req.user.sub as string, filter);
  }

  @Get('deadlines')
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Lấy thống kê hạn chót' })
  @ApiResponse({
    status: 200,
    description: 'Thống kê hạn chót được lấy thành công',
    type: DeadlineAnalyticsDto,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy dự án' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập dự án' })
  async getDeadlineAnalytics(
    @Param('projectId') projectId: string,
    @Request() req: any,
  ): Promise<DeadlineAnalyticsDto> {
    return this.statisticsService.getDeadlineAnalytics(projectId, req.user.sub as string);
  }
}

