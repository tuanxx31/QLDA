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

  /** Tiêu đề nhiệm vụ */
  @ColumnField()
  title: string;

  /** Mô tả chi tiết */
  @ColumnField({ type: 'text', nullable: true })
  description?: string;

  /** Ngày bắt đầu */
  @ColumnField({ type: 'timestamptz', nullable: true })
  startDate?: Date;

  /** Hạn hoàn thành (deadline) */
  @ColumnField({ type: 'timestamptz', nullable: true })
  dueDate?: Date;

  /** Trạng thái task */
  @ColumnField({
    type: 'enum',
    enum: ['todo', 'doing', 'done'],
    default: 'todo',
  })
  status: 'todo' | 'doing' | 'done';

  /** Mức độ ưu tiên */
  @ColumnField({
    type: 'enum',
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  })
  priority: 'low' | 'medium' | 'high';

  /** Vị trí trong cột (dùng cho drag-drop) */
  @ColumnField({ type: 'decimal', precision: 10, scale: 3, default: 0 })
  position: string;

  /** Tiến độ (0–100%) – tính theo subtasks */
  @ColumnField({ type: 'float', default: 0 })
  progress: number;

  /** Thời điểm hoàn thành (nếu có) */
  @ColumnField({ type: 'timestamptz', nullable: true })
  completedAt?: Date;

  /** Người tạo task */
  @ColumnField({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy?: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  creator?: User;

  /** Cột chứa task (Kanban) */
  @ColumnField({ name: 'column_id', type: 'uuid' })
  columnId: string;

  @ManyToOne(() => ColumnEntity, (column) => column.tasks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'column_id' })
  column: ColumnEntity;

  /** Người được giao nhiệm vụ */
  @ManyToMany(() => User)
  @JoinTable({
    name: 'task_assignees',
    joinColumn: { name: 'task_id' },
    inverseJoinColumn: { name: 'user_id' },
  })
  assignees: User[];

  /** Nhãn (thẻ màu) */
  @ManyToMany(() => Label)
  @JoinTable({
    name: 'task_labels',
    joinColumn: { name: 'task_id' },
    inverseJoinColumn: { name: 'label_id' },
  })
  labels: Label[];

  /** Danh sách nhiệm vụ con */
  @OneToMany(() => SubTask, (subtask) => subtask.task, { cascade: true })
  subtasks: SubTask[];

  /** Thời gian tạo & cập nhật */
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
