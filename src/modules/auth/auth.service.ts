import { Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { AuthSessionEntity } from './entities/auth-session.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async login(payload: LoginDto): Promise<AuthSessionEntity> {
    const profile = await this.usersService.findMe();
    return {
      token: `mock-token-${payload.employeeNo ?? 'employee'}`,
      userId: Number(profile.id),
      name: String(profile.name),
      role: profile.role as AuthSessionEntity['role'],
      expiresIn: 7200,
    };
  }

  async profile() {
    const profile = await this.usersService.findMe();
    return {
      id: profile.id,
      employeeNo: profile.employeeNo,
      name: profile.name,
      role: profile.role,
      departmentName: profile.departmentName,
    };
  }
}
