import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Project } from 'src/projects/entities/project.entity';

@Entity('project_members')
@Unique('UQ_project_member', ['project', 'user'])
export class ProjectMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Project, (project) => project.members, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: ['leader', 'editor', 'viewer'],
    default: 'viewer',
    name: 'role',
  })
  role: 'leader' | 'editor' | 'viewer';

  @CreateDateColumn({ name: 'joined_at' })
  joinedAt: Date;
}
