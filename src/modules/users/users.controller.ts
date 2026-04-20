import { Controller, Get, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { QueryUsersDto } from './dto/query-users.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async me() {
    return { code: 0, message: 'ok', data: await this.usersService.findMe() };
  }

  @Get()
  async findAll(@Query() query: QueryUsersDto) {
    return { code: 0, message: 'ok', data: await this.usersService.findAll(query) };
  }
}