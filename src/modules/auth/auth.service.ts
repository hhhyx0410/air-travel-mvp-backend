import { Injectable } from '@nestjs/common';
import { PlatformService } from '../platform/platform.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(private readonly platformService: PlatformService) {}

  async login(payload: LoginDto) {
    return this.platformService.login(payload.username, payload.password);
  }

  async register(payload: RegisterDto) {
    return this.platformService.registerAccount(payload);
  }

  async profile(token?: string) {
    return this.platformService.getProfile(token);
  }

  async logout(token?: string) {
    return this.platformService.logout(token);
  }

  async fetchPendingAdminAccounts(token?: string) {
    return this.platformService.fetchPendingAdminAccounts(token);
  }

  async fetchAdminApprovalHistory(token?: string) {
    return this.platformService.fetchAdminApprovalHistory(token);
  }

  async approveAdminAccount(token: string | undefined, id: number) {
    return this.platformService.approveAdminAccount(token, id);
  }

  async rejectAdminAccount(token: string | undefined, id: number) {
    return this.platformService.rejectAdminAccount(token, id);
  }
}