import type { AssignUsersDto, UpdateTaskDto } from '@/types/task.type';
import { api } from './api';

export const taskService = {
  getAssignees: async (id: string) => {
    const response = await api.get(`/tasks/${id}/assignees`);
    return response.data;
  },
  getByColumn: async (columnId: string) => {
    const response = await api.get(`/tasks/column/${columnId}`);
    return response.data;
  },
  create: async (columnId: string, title: string) => {
    const response = await api.post(`/tasks`, { columnId, title });
    return response.data;
  },
  update: async (id: string, dto: UpdateTaskDto) => {
    const response = await api.patch(`/tasks/${id}`, dto);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },
  assignUsers: async (id: string, dto: AssignUsersDto) => {
    const response = await api.patch(`/tasks/${id}/assignees`, dto);
    return response.data;
  },
  updatePosition: async (
    id: string,
    prevTaskId?: string,
    nextTaskId?: string,
    columnId?: string
  ) => {
    const res = await api.patch(`/tasks/${id}/position`, {
      prevTaskId,
      nextTaskId,
      columnId,
    });
    return res.data;
  },
  
};
