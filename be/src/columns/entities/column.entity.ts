import {
  Entity,
  PrimaryGeneratedColumn,
  Column as ColumnField,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Project } from 'src/projects/entities/project.entity';
import { Task } from 'src/tasks/entities/task.entity';

@Entity('columns')
export class ColumnEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ColumnField({ name: 'name' })
  name: string;

  @ColumnField({ type: 'int', default: 0, name: 'order' })
  order: number;

  @ManyToOne(() => Project, (project) => project.columns, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @OneToMany(() => Task, (task) => task.column, { cascade: true })
  tasks: Task[];
}
