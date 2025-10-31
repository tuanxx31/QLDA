import { api } from './api';

export const columnService = {
  getColumns(projectId: string) {
    return api.get(`/projects/${projectId}/columns`);
  },
  create(projectId: string, data: any) {
    return api.post(`/projects/${projectId}/columns`, data);
  },
  update(id: string, data: any) {
    return api.patch(`/columns/${id}`, data);
  },
  delete(id: string) {
    return api.delete(`/columns/${id}`);
  },
};
