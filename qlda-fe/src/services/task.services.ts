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
  // assignLabels: async (id: string, dto: AssignLabelsDto) => {
  //   const response = await api.patch(`/tasks/${id}/labels`, dto);
  //   return response.data;
  // },
  // updatePosition: async (id: string, position: number, columnId?: string) => {
  //   const response = await api.patch(`/tasks/${id}/position`, { position, columnId });
  //   return response.data;
  // },
  // addSubTask: async (taskId: string, title: string) => {
  //   const response = await api.post(`/tasks/${taskId}/subtasks`, { title });
  //   return response.data;
  // },
  // updateSubTask: async (id: string, dto: UpdateSubTaskDto) => {
  //   const response = await api.patch(`/tasks/subtasks/${id}`, dto);
  //   return response.data;
  // },
  // deleteSubTask: async (id: string) => {
  //   const response = await api.delete(`/tasks/subtasks/${id}`);
  //   return response.data;
  // },
};
