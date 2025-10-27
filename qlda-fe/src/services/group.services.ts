import type { Group, InviteGroupDto } from "@/types/group.type";
import { api } from "./api";
import type { InviteMemberDto } from "@/types/group.type";

export const groupService = {

  async getDetail(groupId: string): Promise<Group> {
    const res = await api.get(`/groups/${groupId}`);
    return res.data;
  },

  async inviteMember(data: InviteMemberDto) {
    const res = await api.post(`/groups/invite`, data);
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

  async findPendingInvites(): Promise<InviteGroupDto[]> {
    const res = await api.get("/groups/pending-invites");
    return res.data;
  },

  async acceptInvite(groupId: string) {
    const res = await api.post(`/groups/accept-invite/${groupId}`);
    return res.data;
  },

  async rejectInvite(groupId: string) {
    const res = await api.post(`/groups/reject-invite/${groupId}`);
    return res.data;
  },
  async leaveGroup(data: { groupId: string }) {
    const res = await api.post(`/group-members/leave`, data);
    return res.data;
  },
  async transferLeader(groupId: string, leaderId: string) {
    const res = await api.put(`/group-members/${groupId}/transfer-leader/${leaderId}`);
    return res.data;
  },
};
