import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() payload: LoginDto) {
    return { code: 0, message: 'ok', data: this.authService.login(payload) };
  }

  @Get('profile')
  profile() {
    return { code: 0, message: 'ok', data: this.authService.profile() };
  }
}
