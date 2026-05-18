import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { CreateMetricDto } from './dto/CreateMetricDto';
import { UpdateMetricDto } from './dto/UpdateMetricDto';
import { JwtAuth } from '../auth/decorators/jwt-auth.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

@ApiTags('metrics')
@ApiBearerAuth()
@Controller('metrics')
@JwtAuth()
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  async getAllMetrics(@Req() req: Request) {
    return this.metricsService.findAllByUserId(req.user.id);
  }

  @Post()
  async createMetric(@Req() req: Request, @Body() body: CreateMetricDto) {
    return this.metricsService.create(req.user.id, body);
  }

  @Patch(':metricId')
  async updateMetric(
    @Req() req: Request,
    @Param('metricId') metricId: string,
    @Body() body: UpdateMetricDto,
  ) {
    return this.metricsService.updateMetricFromUser(
      req.user.id,
      metricId,
      body,
    );
  }
}
