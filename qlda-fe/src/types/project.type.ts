import type { User } from "./user.type";
import type { Group } from "./group.type";

export interface Project {
  id: string;
  name: string;
  description?: string;
  startDate?: string | null;
  status: "todo" | "doing" | "done";
  deadline?: string | null;
  owner: User;
  group?: Group | null;
  manager?: User;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectDto {
  name: string;
  description?: string;
  startDate?: string;
  deadline?: string;
  status?: "todo" | "doing" | "done";
  groupId?: string;
}

export interface UpdateProjectDto extends Partial<CreateProjectDto> {
  id: string;
}
