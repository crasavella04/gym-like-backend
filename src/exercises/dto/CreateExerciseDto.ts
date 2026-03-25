import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ExerciseTypeEnum } from '../types/ExerciseTypeEnum';

export class CreateExerciseDto {
  @ApiProperty({
    example: 'Жим лежа',
  })
  @IsString()
  title: string;

  @ApiProperty({
    example: 'weight | reps | time | distance',
  })
  @IsEnum(ExerciseTypeEnum)
  type: ExerciseTypeEnum;

  @ApiProperty({
    example: 'Упражнение делать пока делается',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
  })
  @IsOptional()
  video?: Express.Multer.File;
}
