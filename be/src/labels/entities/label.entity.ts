import { Project } from 'src/projects/entities/project.entity';
import { Entity, PrimaryGeneratedColumn, Column as ColumnField, OneToMany, ManyToMany, JoinTable, JoinColumn, ManyToOne } from 'typeorm';

@Entity('labels')
export class Label {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ColumnField({ name: 'name' })
  name: string;

  @ColumnField({ default: '#007bff', name: 'color' })
  color: string;

  @ColumnField({ type: 'text', nullable: true, name: 'description' })
  description?: string;

  @ManyToOne(()=>Project, (project)=>project.labels, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;
}

