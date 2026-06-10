import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class UpdateSetRealValuesDto {
  @ApiProperty({ example: 78.5 })
  @IsNumber()
  @IsOptional()
  realWeight?: number;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @IsOptional()
  realReps?: number;

  @ApiProperty({ example: 60 })
  @IsNumber()
  @IsOptional()
  realTime?: number;

  @ApiProperty({ example: 1000 })
  @IsNumber()
  @IsOptional()
  realDistance?: number;
}
