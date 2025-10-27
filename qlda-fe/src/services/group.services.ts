import type { Group } from "@/types/group.type";
import { api } from "./api";

export const groupService = {

  async getDetail(groupId: string): Promise<Group> {
    const res = await api.get(`/groups/${groupId}`);
    return res.data;
  },

  async inviteMember(data: { groupId: string; email: string }) {
    const res = await api.post(`/groups/${data.groupId}/invite`, { email: data.email });
    return res.data;
  },

  async getMyGroups(): Promise<Group[]> {
    const res = await api.get("/groups/my");
    return res.data;
  },

  async createGroup(data: { name: string; description?: string }) {
    const res = await api.post("/groups", data);
    return res.data;
  },

  async deleteGroup(groupId: string) {
    const res = await api.delete(`/groups/${groupId}`);
    return res.data;
  },

  async removeMember(groupId: string, memberId: string) {
    const res = await api.delete(`/group-members/${groupId}/${memberId}`);
    return res.data;
  },
};
