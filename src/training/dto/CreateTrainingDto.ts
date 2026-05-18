import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsNumber,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

class WeightSetDto {
  @ApiProperty()
  @IsNumber()
  weight: number;

  @ApiProperty()
  @IsNumber()
  reps: number;
}

class RepsSetDto {
  @ApiProperty()
  @IsNumber()
  reps: number;
}

class TimeSetDto {
  @ApiProperty()
  @IsNumber()
  time: number;
}

class DistanceSetDto {
  @ApiProperty()
  @IsNumber()
  distance: number;
}

class WeightExerciseDto {
  @ApiProperty()
  @IsUUID()
  id: string;

  @ApiProperty({ enum: ['weight'] })
  @IsIn(['weight'])
  type: 'weight';

  @ApiProperty({ type: [WeightSetDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WeightSetDto)
  sets: WeightSetDto[];
}

class RepsExerciseDto {
  @ApiProperty()
  @IsUUID()
  id: string;

  @ApiProperty({ enum: ['reps'] })
  @IsIn(['reps'])
  type: 'reps';

  @ApiProperty({ type: [RepsSetDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RepsSetDto)
  sets: RepsSetDto[];
}

class TimeExerciseDto {
  @ApiProperty()
  @IsUUID()
  id: string;

  @ApiProperty({ enum: ['time'] })
  @IsIn(['time'])
  type: 'time';

  @ApiProperty({ type: [TimeSetDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSetDto)
  sets: TimeSetDto[];
}

class DistanceExerciseDto {
  @ApiProperty()
  @IsUUID()
  id: string;

  @ApiProperty({ enum: ['distance'] })
  @IsIn(['distance'])
  type: 'distance';

  @ApiProperty({ type: [DistanceSetDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DistanceSetDto)
  sets: DistanceSetDto[];
}

type ExerciseType =
  | WeightExerciseDto
  | RepsExerciseDto
  | TimeExerciseDto
  | DistanceExerciseDto;

@ApiExtraModels(
  WeightExerciseDto,
  RepsExerciseDto,
  TimeExerciseDto,
  DistanceExerciseDto,
)
export class CreateTrainingDto {
  @ApiProperty()
  @IsNumber()
  date: number;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty({
    type: 'array',
    items: {
      oneOf: [
        { $ref: getSchemaPath(WeightExerciseDto) },
        { $ref: getSchemaPath(RepsExerciseDto) },
        { $ref: getSchemaPath(TimeExerciseDto) },
        { $ref: getSchemaPath(DistanceExerciseDto) },
      ],
    },
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object, {
    discriminator: {
      property: 'type',
      subTypes: [
        { value: WeightExerciseDto, name: 'weight' },
        { value: RepsExerciseDto, name: 'reps' },
        { value: TimeExerciseDto, name: 'time' },
        { value: DistanceExerciseDto, name: 'distance' },
      ],
    },
    keepDiscriminatorProperty: true,
  })
  exercises: ExerciseType[];
}
