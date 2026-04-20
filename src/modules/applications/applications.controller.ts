import { Body, Controller, Delete, Get, Headers, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { QueryApplicationsDto } from './dto/query-applications.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  async create(@Headers('x-auth-token') token: string | undefined, @Body() payload: CreateApplicationDto) {
    return { code: 0, message: 'ok', data: await this.applicationsService.create(payload, token) };
  }

  @Get('my')
  async myList(@Headers('x-auth-token') token: string | undefined, @Query() query: QueryApplicationsDto) {
    return { code: 0, message: 'ok', data: await this.applicationsService.myList(query, token) };
  }

  @Get('operator/pending')
  async pendingList(@Headers('x-auth-token') token: string | undefined, @Query() query: QueryApplicationsDto) {
    return { code: 0, message: 'ok', data: await this.applicationsService.pendingList(query, token) };
  }

  @Get()
  async findAll(@Headers('x-auth-token') token: string | undefined, @Query() query: QueryApplicationsDto) {
    return { code: 0, message: 'ok', data: await this.applicationsService.findAll(query, token) };
  }

  @Get(':id')
  async findOne(@Headers('x-auth-token') token: string | undefined, @Param('id', ParseIntPipe) id: number) {
    return { code: 0, message: 'ok', data: await this.applicationsService.findOne(id, token) };
  }

  @Patch(':id/status')
  async updateStatus(@Headers('x-auth-token') token: string | undefined, @Param('id', ParseIntPipe) id: number, @Body() payload: UpdateApplicationStatusDto) {
    return { code: 0, message: 'ok', data: await this.applicationsService.updateStatus(id, payload, token) };
  }

  @Delete(':id')
  async remove(@Headers('x-auth-token') token: string | undefined, @Param('id', ParseIntPipe) id: number) {
    return { code: 0, message: 'ok', data: await this.applicationsService.remove(id, token) };
  }
}