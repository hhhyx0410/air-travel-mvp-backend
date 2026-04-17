import { Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { AuthSessionEntity } from './entities/auth-session.entity';
import { UserRole } from '../../common/enums/user-role.enum';

@Injectable()
export class AuthService {
  login(payload: LoginDto): AuthSessionEntity {
    return {
      token: `mock-token-${payload.employeeNo ?? 'employee'}`,
      userId: 1,
      name: '张三',
      role: UserRole.EMPLOYEE,
      expiresIn: 7200,
    };
  }

  profile() {
    return {
      id: 1,
      employeeNo: 'E10001',
      name: '张三',
      role: UserRole.EMPLOYEE,
    };
  }
}
