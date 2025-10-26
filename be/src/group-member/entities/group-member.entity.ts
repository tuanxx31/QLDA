import { Group } from 'src/groups/entities/group.entity';
import { User } from 'src/users/entities/user.entity';
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
  } from 'typeorm';
  
  @Entity('group_members')
  export class GroupMember {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column()
    groupId: string;
  
    @Column()
    userId: string;
  
    @Column({
      type: 'enum',
      enum: ['leader', 'member'],
      default: 'member',
    })
    role: 'leader' | 'member';
  
    @CreateDateColumn({ name: 'joined_at' })
    joinedAt: Date;
  
    @ManyToOne(() => Group, (group) => group.members, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'group_id' })
    group: Group;
  
    @ManyToOne(() => User, (user) => user.memberships, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;
  }
  