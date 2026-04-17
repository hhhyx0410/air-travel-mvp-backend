import { Injectable } from '@nestjs/common';
import { QueryStatisticsDto } from './dto/query-statistics.dto';

@Injectable()
export class StatisticsService {
  overview(query: QueryStatisticsDto) {
    return {
      month: query.month ?? '2026-04',
      totalApplications: 18,
      totalBooked: 12,
      totalTicketed: 10,
      totalAmount: 38260,
    };
  }

  monthly(query: QueryStatisticsDto) {
    return [
      this.overview(query),
      { month: '2026-03', totalApplications: 15, totalBooked: 11, totalTicketed: 9, totalAmount: 31800 },
    ];
  }
}
