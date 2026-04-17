import { Controller, Get, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { QueryUsersDto } from './dto/query-users.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  me() {
    return { code: 0, message: 'ok', data: this.usersService.findMe() };
  }

  @Get()
  findAll(@Query() query: QueryUsersDto) {
    return { code: 0, message: 'ok', data: this.usersService.findAll(query) };
  }
}
