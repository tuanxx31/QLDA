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
  Index,
} from 'typeorm';
import { ColumnEntity } from 'src/columns/entities/column.entity';
import { User } from 'src/users/entities/user.entity';
import { SubTask } from 'src/sub-tasks/entities/sub-task.entity';
import { Label } from 'src/labels/entities/label.entity';

@Entity('tasks')
@Index(['columnId', 'position'])
@Index(['status'])
@Index(['dueDate'])
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ColumnField()
  title: string;

  @ColumnField({ type: 'text', nullable: true })
  description?: string;

  @ColumnField({ type: 'timestamptz', nullable: true })
  startDate?: Date;

  @ColumnField({ type: 'timestamptz', nullable: true })
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

  @ColumnField({ type: 'decimal', precision: 10, scale: 3, default: 0 })
  position: string;

  @ColumnField({ type: 'float', default: 0 })
  progress: number; // % hoàn thành (dùng cho Sprint 6)

  @ColumnField({ type: 'timestamptz', nullable: true })
  completedAt?: Date;

  @ColumnField({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy?: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  creator?: User;

  @ColumnField({ name: 'column_id', type: 'uuid' })
  columnId: string;

  @ManyToOne(() => ColumnEntity, (column) => column.tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'column_id' })
  column: ColumnEntity;

  @ManyToMany(() => User)
  @JoinTable({
    name: 'task_assignees',
    joinColumn: { name: 'task_id' },
    inverseJoinColumn: { name: 'user_id' },
  })
  assignees: User[];

  @ManyToMany(() => Label)
  @JoinTable({
    name: 'task_labels',
    joinColumn: { name: 'task_id' },
    inverseJoinColumn: { name: 'label_id' },
  })
  labels: Label[];

  @OneToMany(() => SubTask, (subtask) => subtask.task, { cascade: true })
  subtasks: SubTask[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
