import { Module } from '@nestjs/common';
import { IngredientsController } from './ingredients.controller';

@Module({
  controllers: [IngredientsController],
})
export class IngredientsModule {}
