import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() payload: LoginDto) {
    return { code: 0, message: 'ok', data: await this.authService.login(payload) };
  }

  @Get('profile')
  async profile() {
    return { code: 0, message: 'ok', data: await this.authService.profile() };
  }
}