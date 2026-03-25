import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TrainingExercises } from './training-exercises.entity';

@Entity()
export class ExerciseSets {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => TrainingExercises, (exercises) => exercises.sets, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'trainingExercisesId' })
  exercise: TrainingExercises;

  @Column({ type: 'integer' })
  orderNumber: number;

  @Column({ type: 'float', nullable: true })
  plannedWeight?: number;

  @Column({ type: 'float', nullable: true })
  realWeight?: number;

  @Column({ type: 'int', nullable: true })
  plannedReps?: number;

  @Column({ type: 'int', nullable: true })
  realReps?: number;

  @Column({ type: 'int', nullable: true })
  plannedTime?: number;

  @Column({ type: 'int', nullable: true })
  realTime?: number;

  @Column({ type: 'int', nullable: true })
  plannedDistance?: number;

  @Column({ type: 'int', nullable: true })
  realDistance?: number;
}
