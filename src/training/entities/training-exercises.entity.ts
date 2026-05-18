import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Training } from './training.entity';
import { Exercise } from 'src/exercises/entities/exercises.entity';
import { ExerciseSets } from './exercise_sets.entity';

@Entity()
export class TrainingExercises {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Training, (training) => training.exercises, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'trainingId' })
  training: Training;

  @ManyToOne(() => Exercise, () => {}, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'exerciseId' })
  exercise: Exercise;

  @OneToMany(() => ExerciseSets, (set) => set.exercise)
  sets: ExerciseSets[];

  @Column({ type: 'integer' })
  orderNumber: number;
}
