import { api } from './api';
import type { ScheduleTask } from '@/types/schedule.type';

export const scheduleService = {
  getMySchedule: async (startDate: string, endDate: string): Promise<ScheduleTask[]> => {
    const response = await api.get('/tasks/schedule/my', {
      params: { startDate, endDate },
    });
    return response.data;
  },
};
