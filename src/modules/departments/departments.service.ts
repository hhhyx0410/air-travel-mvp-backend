import { Injectable } from '@nestjs/common';
import { QueryDepartmentsDto } from './dto/query-departments.dto';
import { DepartmentEntity } from './entities/department.entity';

@Injectable()
export class DepartmentsService {
  findAll(_query: QueryDepartmentsDto): DepartmentEntity[] {
    return [
      { id: 1, name: '市场部', code: 'MARKETING', parentId: null, status: 1 },
      { id: 2, name: '财务部', code: 'FINANCE', parentId: null, status: 1 },
    ];
  }
}
