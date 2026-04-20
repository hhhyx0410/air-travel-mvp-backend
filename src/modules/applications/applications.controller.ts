import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { QueryApplicationsDto } from './dto/query-applications.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  async create(@Body() payload: CreateApplicationDto) {
    return { code: 0, message: 'ok', data: await this.applicationsService.create(payload) };
  }

  @Get('my')
  async myList(@Query() query: QueryApplicationsDto) {
    return { code: 0, message: 'ok', data: await this.applicationsService.myList(query) };
  }

  @Get('operator/pending')
  async pendingList(@Query() query: QueryApplicationsDto) {
    return { code: 0, message: 'ok', data: await this.applicationsService.pendingList(query) };
  }

  @Get()
  async findAll(@Query() query: QueryApplicationsDto) {
    return { code: 0, message: 'ok', data: await this.applicationsService.findAll(query) };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return { code: 0, message: 'ok', data: await this.applicationsService.findOne(id) };
  }

  @Patch(':id/status')
  async updateStatus(@Param('id', ParseIntPipe) id: number, @Body() payload: UpdateApplicationStatusDto) {
    return { code: 0, message: 'ok', data: await this.applicationsService.updateStatus(id, payload) };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return { code: 0, message: 'ok', data: await this.applicationsService.remove(id) };
  }
}