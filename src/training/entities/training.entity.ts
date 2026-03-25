import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TrainingExercises } from './training-exercises.entity';

@Entity()
export class Training {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => {}, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => User, (user) => {}, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'authorId' })
  author: User;

  @OneToMany(() => TrainingExercises, (exercises) => exercises.training)
  exercises: TrainingExercises[];

  @Column({ type: 'timestamp' })
  date: number;
}
