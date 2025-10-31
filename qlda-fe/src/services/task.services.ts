import { api } from "./api";

export const taskService = {
  getTasks(columnId: string) {
    return api.get(`/columns/${columnId}/tasks`);
  },
  create(columnId: string, data: any) {
    return api.post(`/columns/${columnId}/tasks`, data);
  },
  update(id: string, data: any) {
    return api.patch(`/tasks/${id}`, data);
  },
  delete(id: string) {
    return api.delete(`/tasks/${id}`);
  },
};
