import { api } from './api';

export const subtaskService = {
  getSubtasks(taskId: string) {
    return api.get(`/tasks/${taskId}/subtasks`);
  },
  create(taskId: string, data: any) {
    return api.post(`/tasks/${taskId}/subtasks`, data);
  },
  update(id: string, data: any) {
    return api.patch(`/subtasks/${id}`, data);
  },
  delete(id: string) {
    return api.delete(`/subtasks/${id}`);
  },
};
