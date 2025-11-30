import {
  Entity,
  PrimaryGeneratedColumn,
  Column as ColumnField,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Task } from 'src/tasks/entities/task.entity';

@Entity('subtasks')
@Index(['taskId'])
export class SubTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ColumnField({ name: 'title' })
  title: string;

  @ColumnField({ default: false, name: 'completed' })
  completed: boolean;

  @ColumnField({ type: 'timestamp', nullable: true, name: 'completed_at' })
  completedAt?: Date;

  @ColumnField({ type: 'decimal', precision: 10, scale: 3, default: 0, name: 'position' })
  position: string;

  @ColumnField({ name: 'task_id', type: 'uuid' })
  taskId: string;

  @ManyToOne(() => Task, (task) => task.subtasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task: Task;
}
