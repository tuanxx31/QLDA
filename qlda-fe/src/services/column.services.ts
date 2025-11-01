import { api } from './api';

export const columnService = {
  getColumns(projectId: string) {
    return api.get(`/projects/${projectId}/columns`);
  },
  create(projectId: string, data: any) {
    return api.post(`/projects/${projectId}/columns`, data);
  },
  update( projectId: string, id: string, data: any) {
    return api.patch(`/projects/${projectId}/columns/${id}`, data);
  },
  deleteColumn(projectId: string, id: string) {
    return api.delete(`/projects/${projectId}/columns/${id}`);
  },
};
