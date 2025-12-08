import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Group } from 'src/groups/entities/group.entity';
import { ProjectMember } from 'src/project-members/entities/project-member.entity';
import { ColumnEntity } from 'src/columns/entities/column.entity';
import { Label } from 'src/labels/entities/label.entity';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'name' })
  name: string;

  @Column({ type: 'text', nullable: true, name: 'description' })
  description?: string;

  @Column({ type: 'date', nullable: true, name: 'start_date' })
  startDate?: Date;

  @Column({ type: 'date', nullable: true, name: 'deadline' })
  deadline?: Date;

  @Column({
    type: 'enum',
    enum: ['todo', 'doing', 'done'],
    default: 'todo',
    name: 'status',
  })
  status: 'todo' | 'doing' | 'done';

  @ManyToOne(() => User, (user) => user.ownedProjects, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @ManyToOne(() => Group, (group) => group.projects, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'group_id' })
  group?: Group | null;

  @OneToMany(() => ProjectMember, (member) => member.project, {
    cascade: true,
  })
  members: ProjectMember[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => ColumnEntity, (column) => column.project, { cascade: true })
  columns: ColumnEntity[];

  @OneToMany(() => Label, (label) => label.project, { cascade: true })
  labels: Label[];
}
