import { Controller, Get, Query } from '@nestjs/common';
import { ExportsService } from './exports.service';
import { ExportRecordsDto } from './dto/export-records.dto';

@Controller('exports')
export class ExportsController {
  constructor(private readonly exportsService: ExportsService) {}

  @Get('travel-records')
  exportTravelRecords(@Query() query: ExportRecordsDto) {
    return { code: 0, message: 'ok', data: this.exportsService.exportTravelRecords(query) };
  }
}
