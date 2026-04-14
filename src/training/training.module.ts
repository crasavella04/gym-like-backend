import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainingService } from './training.service';
import { TrainingController } from './training.controller';
import { Training } from './entities/training.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Training])],
  controllers: [TrainingController],
  providers: [TrainingService],
  exports: [TrainingService],
})
export class TrainingModule {}
