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

  @ColumnField()
  title: string;

  @ColumnField({ default: false })
  completed: boolean;

  // 🔹 MySQL không hỗ trợ timestamptz → dùng timestamp
  @ColumnField({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  @ColumnField({ type: 'decimal', precision: 10, scale: 3, default: 0 })
  position: string;

  @ColumnField({ name: 'task_id', type: 'uuid' })
  taskId: string;

  @ManyToOne(() => Task, (task) => task.subtasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task: Task;
}
