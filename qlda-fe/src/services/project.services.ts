import type {
  CreateProjectDto,
  UpdateProjectDto,
  Project,
  ProjectMember,
  CreateProjectMemberDto,
  ProjectProgress,
  ColumnProgress,
  UserProgress,
  DeadlineSummary,
} from '@/types/project.type';
import { api } from './api';

export const projectService = {
  async create(data: CreateProjectDto) {
    const res = await api.post<Project>('/projects', data);
    return res.data;
  },

  async getAllByUser() {
    const res = await api.get<Project[]>('/projects');
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

  async getByGroupId(groupId: string) {
    const res = await api.get<Project[]>(`/projects/group/${groupId}`);
    return res.data;
  },

  async getProgress(projectId: string) {
    const res = await api.get<ProjectProgress>(`/projects/${projectId}/progress`);
    return res.data;
  },

  async getColumnProgress(projectId: string) {
    const res = await api.get<ColumnProgress[]>(
      `/projects/${projectId}/progress/columns`,
    );
    return res.data;
  },

  async getUserProgress(projectId: string) {
    const res = await api.get<UserProgress[]>(
      `/projects/${projectId}/progress/users`,
    );
    return res.data;
  },

  async getDeadlineSummary(projectId: string) {
    const res = await api.get<DeadlineSummary>(
      `/projects/${projectId}/progress/deadline-summary`,
    );
    return res.data;
  },
};

export const projectMemberService = {
  async getProjectMebers(projectId: string,taskId?: string) {
    const res = await api.get<ProjectMember[]>(`/project-members/${projectId}${taskId ? `?taskId=${taskId}` : ''}`);
    return res.data;
  },
  async remove(projectId: string, userId: string) {
    const res = await api.delete(`/project-members/${projectId}/${userId}`);
    return res.data;
  },
  async addMember(projectId: string, data: CreateProjectMemberDto) {
    const res = await api.post(`/project-members/${projectId}`, data);
    return res.data;
  },
  async transferLeader(projectId: string, newLeaderId: string) {
    const res = await api.put(`/project-members/${projectId}/transfer-leader/${newLeaderId}`);
    return res.data;
  },
  async addMembers(projectId: string, data: { userIds: string[] }) {
    const res = await api.post(`/project-members/${projectId}/add-members`, data);
    return res.data;
  },
};
