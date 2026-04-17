import { Injectable } from '@nestjs/common';
import { QueryUsersDto } from './dto/query-users.dto';
import { UserEntity } from './entities/user.entity';
import { UserRole } from '../../common/enums/user-role.enum';

@Injectable()
export class UsersService {
  findMe(): UserEntity {
    return {
      id: 1,
      employeeNo: 'E10001',
      name: '张三',
      mobile: '13800000000',
      email: 'zhangsan@example.com',
      departmentId: 1,
      departmentName: '市场部',
      role: UserRole.EMPLOYEE,
      status: 1,
    };
  }

  findAll(query: QueryUsersDto) {
    return {
      list: [this.findMe()],
      page: query.page,
      pageSize: query.pageSize,
      total: 1,
    };
  }
}
