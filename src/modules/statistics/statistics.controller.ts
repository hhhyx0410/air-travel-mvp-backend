import { Controller, Get, Query } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { QueryStatisticsDto } from './dto/query-statistics.dto';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('overview')
  overview(@Query() query: QueryStatisticsDto) {
    return { code: 0, message: 'ok', data: this.statisticsService.overview(query) };
  }

  @Get('monthly')
  monthly(@Query() query: QueryStatisticsDto) {
    return { code: 0, message: 'ok', data: this.statisticsService.monthly(query) };
  }
}
