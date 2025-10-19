import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  name: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({
    nullable: true,
    default: 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
  })
  avatar: string;
  

  @Column({ nullable: true })
  studentCode: string;

  @Column({ nullable: true })
  department: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
