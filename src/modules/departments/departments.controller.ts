import { Controller, Get, Query } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { QueryDepartmentsDto } from './dto/query-departments.dto';

@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Get()
  findAll(@Query() query: QueryDepartmentsDto) {
    return { code: 0, message: 'ok', data: this.departmentsService.findAll(query) };
  }
}
