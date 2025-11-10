// ─────────────────────────────────────────────
// SubTask interface

import type { Task } from "./task.type";


// ─────────────────────────────────────────────

// ─────────────────────────────────────────────
// Column interface
// ─────────────────────────────────────────────
export interface Column {
  id: string;
  name: string;
  order: number;
  projectId?: string;
  tasks?: Task[];
}
