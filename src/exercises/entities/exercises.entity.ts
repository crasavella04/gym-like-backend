import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ExerciseTypeEnum } from '../types/ExerciseTypeEnum';

@Entity('exercises')
export class Exercise {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'varchar', length: 50 })
  type: ExerciseTypeEnum;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  videoLink: string;
}
