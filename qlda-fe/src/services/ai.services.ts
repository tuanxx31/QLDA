import { api } from './api';

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

export const aiService = {
    
    suggestSchedule: async (date: string): Promise<ScheduleSuggestionResponse> => {
        const res = await api.post<ScheduleSuggestionResponse>('/ai/suggest-schedule', { date });
        return res.data;
    },

    
    getWorkloadAnalysis: async (startDate: string, endDate: string): Promise<WorkloadAnalysisResponse> => {
        const res = await api.get<WorkloadAnalysisResponse>('/ai/workload-analysis', {
            params: { startDate, endDate },
        });
        return res.data;
    },
};
