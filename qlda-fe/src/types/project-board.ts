export interface SubTask {
    id: string;
    title: string;
    completed: boolean;
  }
  
  export interface Task {
    id: string;
    title: string;
    description?: string;
    status: "todo" | "doing" | "done";
    priority: "low" | "medium" | "high";
    subtasks?: SubTask[];
  }
  
  export interface Column {
    id: string;
    name: string;
    order: number;
    tasks?: Task[];
  }
  