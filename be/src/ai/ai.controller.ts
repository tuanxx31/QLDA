import {
    Controller,
    Post,
    Get,
    Body,
    Query,
    UseGuards,
    Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { AiService } from './ai.service';
import {
    SuggestScheduleDto,
    WorkloadAnalysisDto,
    ScheduleSuggestionResponse,
    WorkloadAnalysisResponse,
} from './dto/suggest-schedule.dto';

@ApiTags('AI')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('ai')
export class AiController {
    constructor(private readonly aiService: AiService) { }

    @Post('suggest-schedule')
    @ApiOperation({
        summary: 'Get AI-powered schedule suggestions for a specific day',
        description:
            'Analyzes user tasks and provides optimized schedule suggestions using AI',
    })
    async suggestSchedule(
        @Request() req,
        @Body() dto: SuggestScheduleDto,
    ): Promise<ScheduleSuggestionResponse> {
        const userId = req.user.sub;
        const date = new Date(dto.date);
        return this.aiService.suggestDailySchedule(userId, date);
    }

    @Get('workload-analysis')
    @ApiOperation({
        summary: 'Analyze workload for a date range',
        description:
            'Provides workload analysis including overdue tasks, upcoming deadlines, and recommendations',
    })
    async analyzeWorkload(
        @Request() req,
        @Query() dto: WorkloadAnalysisDto,
    ): Promise<WorkloadAnalysisResponse> {
        const userId = req.user.sub;
        const startDate = new Date(dto.startDate);
        const endDate = new Date(dto.endDate);
        return this.aiService.analyzeWorkload(userId, startDate, endDate);
    }
}
