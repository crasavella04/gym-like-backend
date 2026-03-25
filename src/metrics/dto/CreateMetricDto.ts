import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateMetricDto {
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

  @ApiProperty({
    description: 'id пользователя',
    example: 'qwe1-rty2-uio3',
  })
  @IsString()
  userId: string;
}
