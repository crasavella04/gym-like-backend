import { PartialType } from '@nestjs/swagger';
import { CreateTrainingDto } from './CreateTrainingDto';

export class UpdateTrainingDto extends PartialType(CreateTrainingDto) {}
