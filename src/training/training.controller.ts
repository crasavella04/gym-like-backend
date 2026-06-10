import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TrainingService } from './training.service';
import { CreateTrainingDto } from './dto/CreateTrainingDto';
import { UpdateTrainingDto } from './dto/UpdateTrainingDto';
import { UpdateSetRealValuesDto } from './dto/UpdateSetRealValuesDto';
import { JwtAuth } from '../auth/decorators/jwt-auth.decorator';

@ApiTags('training')
@ApiBearerAuth()
@Controller('training')
@JwtAuth()
export class TrainingController {
  constructor(private readonly trainingService: TrainingService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new training' })
  @ApiResponse({ status: 201, description: 'Training created successfully' })
  create(@Req() req: Request, @Body() createTrainingDto: CreateTrainingDto) {
    return this.trainingService.create(req.user.id, createTrainingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all trainings for current user' })
  @ApiResponse({
    status: 200,
    description: 'Returns all trainings for the user',
  })
  findAll(@Req() req: Request) {
    return this.trainingService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific training by ID' })
  @ApiResponse({ status: 200, description: 'Returns the training' })
  @ApiResponse({ status: 404, description: 'Training not found' })
  findOne(@Req() req: Request, @Param('id') id: string) {
    return this.trainingService.findOne(req.user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a training' })
  @ApiResponse({ status: 200, description: 'Training updated successfully' })
  @ApiResponse({ status: 404, description: 'Training not found' })
  update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updateTrainingDto: UpdateTrainingDto,
  ) {
    return this.trainingService.update(req.user.id, id, updateTrainingDto);
  }

  @Patch(':trainingId/sets/:setId')
  @ApiOperation({ summary: 'Update real values for a training set' })
  @ApiResponse({ status: 200, description: 'Set updated successfully' })
  @ApiResponse({ status: 404, description: 'Set not found' })
  updateSetRealValues(
    @Param('trainingId') trainingId: string,
    @Param('setId') setId: string,
    @Body() dto: UpdateSetRealValuesDto,
  ) {
    return this.trainingService.updateSetRealValues(trainingId, setId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a training' })
  @ApiResponse({ status: 200, description: 'Training deleted successfully' })
  @ApiResponse({ status: 404, description: 'Training not found' })
  remove(@Req() req: Request, @Param('id') id: string) {
    console.log(1, id);
    return this.trainingService.remove(req.user.id, id);
  }
}
