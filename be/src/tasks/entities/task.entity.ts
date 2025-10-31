import {
  Entity,
  PrimaryGeneratedColumn,
  Column as ColumnField,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ColumnEntity } from 'src/columns/entities/column.entity';
import { User } from 'src/users/entities/user.entity';
import { SubTask } from 'src/sub-tasks/entities/sub-task.entity';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ColumnField()
  title: string;

  @ColumnField({ type: 'text', nullable: true })
  description?: string;

  @ColumnField({ type: 'date', nullable: true })
  startDate?: Date;

  @ColumnField({ type: 'date', nullable: true })
  dueDate?: Date;

  @ColumnField({
    type: 'enum',
    enum: ['todo', 'doing', 'done'],
    default: 'todo',
  })
  status: 'todo' | 'doing' | 'done';

  @ColumnField({
    type: 'enum',
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  })
  priority: 'low' | 'medium' | 'high';

  @ManyToOne(() => ColumnEntity, (column) => column.tasks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'column_id' })
  column: ColumnEntity;

  @ManyToMany(() => User)
  @JoinTable({
    name: 'task_assignees',
    joinColumn: { name: 'task_id' },
    inverseJoinColumn: { name: 'user_id' },
  })
  assignees: User[];

  @OneToMany(() => SubTask, (subtask) => subtask.task, { cascade: true })
  subtasks: SubTask[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
