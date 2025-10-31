export class CreateTaskDto {
    title: string;
    description?: string;
    startDate?: Date;
    dueDate?: Date;
    status?: 'todo' | 'doing' | 'done';
    priority?: 'low' | 'medium' | 'high';
  }