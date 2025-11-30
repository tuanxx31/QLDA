import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { GroupMember } from 'src/group-member/entities/group-member.entity';
import { Project } from 'src/projects/entities/project.entity';

@Entity('groups')
export class Group {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, name: 'name' })
  name: string;

  @Column({ type: 'text', nullable: true, name: 'description' })
  description: string;

  @Column({ unique: true, length: 10, name: 'invite_code' })
  inviteCode: string;

  @ManyToOne(() => User, (user) => user.ownedGroups, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'leader_id' })
  leader: User;

  @OneToMany(() => GroupMember, (member) => member.group)
  members: GroupMember[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Project, (project) => project.group)
  projects: Project[];
}
