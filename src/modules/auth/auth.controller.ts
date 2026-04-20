import { Body, Controller, Get, Headers, Param, ParseIntPipe, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() payload: LoginDto) {
    return { code: 0, message: 'ok', data: await this.authService.login(payload) };
  }

  @Post('register')
  async register(@Body() payload: RegisterDto) {
    return { code: 0, message: 'ok', data: await this.authService.register(payload) };
  }

  @Post('logout')
  async logout(@Headers('x-auth-token') token?: string) {
    return { code: 0, message: 'ok', data: await this.authService.logout(token) };
  }

  @Get('profile')
  async profile(@Headers('x-auth-token') token?: string) {
    return { code: 0, message: 'ok', data: await this.authService.profile(token) };
  }

  @Get('admin-approvals/pending')
  async fetchPendingAdminAccounts(@Headers('x-auth-token') token?: string) {
    return { code: 0, message: 'ok', data: await this.authService.fetchPendingAdminAccounts(token) };
  }

  @Get('admin-approvals/history')
  async fetchAdminApprovalHistory(@Headers('x-auth-token') token?: string) {
    return { code: 0, message: 'ok', data: await this.authService.fetchAdminApprovalHistory(token) };
  }

  @Post('admin-approvals/:id/approve')
  async approveAdminAccount(@Headers('x-auth-token') token: string | undefined, @Param('id', ParseIntPipe) id: number) {
    return { code: 0, message: 'ok', data: await this.authService.approveAdminAccount(token, id) };
  }

  @Post('admin-approvals/:id/reject')
  async rejectAdminAccount(@Headers('x-auth-token') token: string | undefined, @Param('id', ParseIntPipe) id: number) {
    return { code: 0, message: 'ok', data: await this.authService.rejectAdminAccount(token, id) };
  }
}