import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserEntity } from './entities/user.entity';
import { DepartmentEntity } from '../departments/entities/department.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, DepartmentEntity])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
