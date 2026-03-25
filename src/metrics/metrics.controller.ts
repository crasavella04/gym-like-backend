import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { CreateMetricDto } from './dto/CreateMetricDto';
import { UpdateMetricDto } from './dto/UpdateMetricDto';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get(':userId')
  async getAllMetrics(@Param('userId') userId: string) {
    return this.metricsService.findAllByUserId(userId);
  }

  @Post()
  async createMetric(@Body() body: CreateMetricDto) {
    return this.metricsService.create(body);
  }

  @Patch(':userId/:metricId')
  async updateMetric(
    @Param('userId') userId: string,
    @Param('metricId') metricId: string,
    @Body() body: UpdateMetricDto,
  ) {
    return this.metricsService.updateMetricFromUser(userId, metricId, body);
  }
}
