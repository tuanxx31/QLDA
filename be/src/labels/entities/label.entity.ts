import { Entity, PrimaryGeneratedColumn, Column as ColumnField } from 'typeorm';

@Entity('labels')
export class Label {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ColumnField()
  name: string;

  @ColumnField({ default: '#007bff' })
  color: string;

  @ColumnField({ type: 'text', nullable: true })
  description?: string;
}
