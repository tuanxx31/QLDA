import type {
  CreateProjectDto,
  UpdateProjectDto,
  Project,
} from "@/types/project.type";
import { api } from "./api";

export const projectService = {
  async create(data: CreateProjectDto) {
    const res = await api.post<Project>("/projects", data);
    return res.data;
  },

  async getAllByUser() {
    const res = await api.get<Project[]>("/projects");
    return res.data;
  },

  async getByGroup(groupId: string) {
    const res = await api.get<Project[]>(`/projects/group/${groupId}`);
    return res.data;
  },

  async getById(id: string) {
    const res = await api.get<Project>(`/projects/${id}`);
    return res.data;
  },

  async update(id: string, data: UpdateProjectDto) {
    const res = await api.patch<Project>(`/projects/${id}`, data);
    return res.data;
  },

  async remove(id: string) {
    const res = await api.delete(`/projects/${id}`);
    return res.data;
  },
};


export const projectMemberService = {
   
}