import {
  Entity,
  PrimaryGeneratedColumn,
  Column as ColumnField,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Task } from 'src/tasks/entities/task.entity';

@Entity('subtasks')
export class SubTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ColumnField()
  title: string;

  @ColumnField({ default: false })
  completed: boolean;

  @ManyToOne(() => Task, (task) => task.subtasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task: Task;
}
