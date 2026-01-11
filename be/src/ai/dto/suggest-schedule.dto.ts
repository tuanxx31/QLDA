import { IsDateString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SuggestScheduleDto {
    @ApiProperty({
        description: 'Date to get schedule suggestions for',
        example: '2026-01-10',
    })
    @IsDateString()
    date: string;
}

export class SuggestRescheduleDto {
    @ApiProperty({
        description: 'Start date of the range',
        example: '2026-01-10',
    })
    @IsDateString()
    startDate: string;

    @ApiProperty({
        description: 'End date of the range',
        example: '2026-01-17',
    })
    @IsDateString()
    endDate: string;
}

export class WorkloadAnalysisDto {
    @ApiProperty({
        description: 'Start date of the range',
        example: '2026-01-10',
    })
    @IsDateString()
    startDate: string;

    @ApiProperty({
        description: 'End date of the range',
        example: '2026-01-17',
    })
    @IsDateString()
    endDate: string;
}

export interface TaskSuggestion {
    taskId: string;
    taskTitle: string;
    order: number;
    suggestedStartTime: string;
    reason: string;
    priority: string;
}

export interface ScheduleSuggestionResponse {
    suggestions: TaskSuggestion[];
    warnings: string[];
    summary: string;
}

export interface WorkloadAnalysisResponse {
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
    upcomingDeadlines: {
        taskId: string;
        taskTitle: string;
        dueDate: string;
        priority: string;
    }[];
    workloadLevel: 'low' | 'medium' | 'high' | 'overloaded';
    recommendations: string[];
}
