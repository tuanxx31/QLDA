import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Group } from 'src/groups/entities/group.entity';
import { User } from 'src/users/entities/user.entity';

@Entity('group_members')
@Unique('UQ_group_members_group_user', ['group', 'user'])
export class GroupMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Group, (group) => group.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_id' })
  group: Group;

  @ManyToOne(() => User, (user) => user.memberships, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: ['leader', 'member'],
    default: 'member',
    name: 'role',
  })
  role: 'leader' | 'member';

  @Column({
    type: 'enum',
    enum: ['pending', 'accepted', 'rejected'],
    default: 'accepted',
    name: 'status',
  })
  status: 'pending' | 'accepted' | 'rejected';

  @CreateDateColumn({ name: 'joined_at' })
  joinedAt: Date;
}
