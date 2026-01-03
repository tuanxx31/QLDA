import { GroupMember } from 'src/group-member/entities/group-member.entity';
import { Group } from 'src/groups/entities/group.entity';
import { ProjectMember } from 'src/project-members/entities/project-member.entity';
import { Project } from 'src/projects/entities/project.entity';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, name: 'name' })
  name: string;

  @Column({ unique: true, name: 'email' })
  email: string;

  @Column({ nullable: true, name: 'password', type: 'varchar' })
  password: string;

  @Column({ nullable: true, unique: true, name: 'google_id' })
  googleId: string;

  @Column({ nullable: true, name: 'provider' })
  provider: 'local' | 'google';

  @Column({ nullable: true ,name: 'date_of_birth'})
  dateOfBirth?: Date;

  @Column({
    nullable: true,
    default: 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
    name: 'avatar',
  })
  avatar: string;

  @Column({ nullable: true ,name: 'student_code'})
  studentCode: string;

  @Column({ nullable: true, name: 'department' })
  department: string;

  @Column({ nullable: true, name: 'gender' })
  gender: 'male' | 'female' | 'other';

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Group, (group) => group.leader)
  ownedGroups: Group[];

  @OneToMany(() => GroupMember, (member) => member.user)
  memberships: GroupMember[];

  @OneToMany(() => Project, (project) => project.owner)
  ownedProjects: Project[];

  @OneToMany(() => ProjectMember, (member) => member.user)
  projectMemberships: ProjectMember[];
}
