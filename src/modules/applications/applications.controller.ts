import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { QueryApplicationsDto } from './dto/query-applications.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  create(@Body() payload: CreateApplicationDto) {
    return { code: 0, message: 'ok', data: this.applicationsService.create(payload) };
  }

  @Get('my')
  myList(@Query() query: QueryApplicationsDto) {
    return { code: 0, message: 'ok', data: this.applicationsService.myList(query) };
  }

  @Get('operator/pending')
  pendingList(@Query() query: QueryApplicationsDto) {
    return { code: 0, message: 'ok', data: this.applicationsService.pendingList(query) };
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return { code: 0, message: 'ok', data: this.applicationsService.findOne(id) };
  }

  @Patch(':id/status')
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() payload: UpdateApplicationStatusDto) {
    return { code: 0, message: 'ok', data: this.applicationsService.updateStatus(id, payload) };
  }
}
