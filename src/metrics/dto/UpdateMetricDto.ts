import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class UpdateMetricDto {
  @ApiProperty({
    description: 'Рост',
    example: '188',
  })
  @IsNumber()
  @IsOptional()
  height?: number;

  @ApiProperty({
    description: 'Вес',
    example: '90.5',
  })
  @IsNumber()
  @IsOptional()
  weight?: number;

  @ApiProperty({
    description: 'Обхват талии',
    example: '70',
  })
  @IsNumber()
  @IsOptional()
  waistCircumference?: number;

  @ApiProperty({
    description: 'Обхват груди',
    example: '94',
  })
  @IsNumber()
  @IsOptional()
  chestCircumference?: number;

  @ApiProperty({
    description: 'Обхват бедер',
    example: '95',
  })
  @IsNumber()
  @IsOptional()
  hipCircumference?: number;
}
