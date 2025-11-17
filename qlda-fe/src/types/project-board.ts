


import type { Task } from "./task.type";





export interface Column {
  id: string;
  name: string;
  order: number;
  projectId?: string;
  tasks?: Task[];
}
