import { api } from "./api";

export const labelService = {
  getLabels: async () => {
    const response = await api.get(`/labels`);
    return response.data;
  },
  getLabelsByProject: async (projectId: string) => {
    const response = await api.get(`/labels/project/${projectId}`);
    return response.data;
  },
 createLabel: async (name: string | undefined, color: string, projectId: string) => {
    const response = await api.post(`/labels`, { name: name || '', color, projectId });
    return response.data;
  },
  updateLabel: async (id: string, name: string, color: string) => {
    const response = await api.patch(`/labels/${id}`, { name, color });
    return response.data;
  },
  deleteLabel: async (id: string) => {
    const response = await api.delete(`/labels/${id}`);
    return response.data;
  },
};