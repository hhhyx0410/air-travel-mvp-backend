import { Injectable } from '@nestjs/common';
import { ExportRecordsDto } from './dto/export-records.dto';

@Injectable()
export class ExportsService {
  exportTravelRecords(query: ExportRecordsDto) {
    return {
      fileName: `travel-records-${query.month ?? 'all'}.xlsx`,
      downloadUrl: '/downloads/travel-records-demo.xlsx',
      expiresAt: '2026-04-17 23:59:59',
    };
  }
}
