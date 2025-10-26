import { GroupMember } from 'src/group-member/entities/group-member.entity';
import { Group } from 'src/groups/entities/group.entity';
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
  @PrimaryGeneratedColumn('uuid') // 👉 nên dùng uuid để dễ liên kết trong hệ thống lớn
  id: string;

  @Column({ nullable: true })
  name: string;

  @Column({ unique: true })
  email: string; // 👉 nên unique vì dùng để login

  @Column({ nullable: true, select: false })
  password: string; // 👉 không nên tự động select ra để bảo mật

  @Column({
    nullable: true,
    default: 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
  })
  avatar: string;

  @Column({ nullable: true })
  studentCode: string; // Mã sinh viên

  @Column({ nullable: true })
  department: string; // Khoa / Bộ môn

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // 🔗 Quan hệ với bảng Group và GroupMember
  @OneToMany(() => Group, (group) => group.leader)
  ownedGroups: Group[];

  @OneToMany(() => GroupMember, (member) => member.user)
  memberships: GroupMember[];
}
