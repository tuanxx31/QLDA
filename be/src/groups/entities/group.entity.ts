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
  
  @Entity('groups')
  export class Group {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ length: 100 })
    name: string;
  
    @Column({ type: 'text', nullable: true })
    description: string;
  
    @Column({ unique: true, length: 10 })
    code: string; // mã mời nhóm (VD: ABCD1234)
  
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
  }
  