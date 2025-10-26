import type { Group } from "@/types/group.type";
import { api } from "./api";

export const groupService = {
  async getMyGroups(): Promise<Group[]> {
    const res = await api.get("/groups/my");
    return res.data;
  },

  async createGroup(data: { name: string; description?: string }) {
    const res = await api.post("/groups", data);
    return res.data;
  },
};
