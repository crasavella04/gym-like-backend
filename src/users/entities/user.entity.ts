import { Exclude } from 'class-transformer';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { GenderEnum } from '../types/GenderEnum';
import { RoleEnum } from '../types/RoleEnum';
import { Metric } from 'src/metrics/entities/metrics.entity';
import { TrainingGoalEnum } from '../types/TrainingGoalEnum';
import { Meal } from 'src/meals/entities/meal.entity';
import { Training } from 'src/training/entities/training.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  firstname: string;

  @Column({ type: 'varchar', length: 100 })
  lastname: string;

  @Column({ type: 'varchar', length: 255, default: RoleEnum.TRAINEE })
  role: RoleEnum;

  @Column({ type: 'varchar', length: 255 })
  @Exclude()
  password: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  gender: GenderEnum;

  @Column({ type: 'varchar', length: 500, nullable: true })
  trainingGoal: TrainingGoalEnum;

  @Column({ type: 'int', nullable: true })
  date_birth: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatar: string;

  @ManyToOne(() => User, (user) => user.students, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'trainerId' })
  trainer: User;

  @OneToMany(() => Metric, (metric) => metric.user)
  metrics: Metric[];

  @OneToMany(() => User, (user) => user.trainer)
  students: User[];

  @OneToMany(() => Meal, (meal) => meal.user)
  meals: Meal[];

  @OneToMany(() => Training, (training) => training.user)
  trainings: Training[];

  @Column({ type: 'uuid', nullable: true })
  trainerId: string;

  @Column({ type: 'int', nullable: true })
  height?: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
