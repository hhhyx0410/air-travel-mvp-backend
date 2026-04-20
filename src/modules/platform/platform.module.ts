import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepartmentEntity } from '../departments/entities/department.entity';
import { UserEntity } from '../users/entities/user.entity';
import { PlatformService } from './platform.service';

@Module({
  imports: [TypeOrmModule.forFeature([DepartmentEntity, UserEntity])],
  providers: [PlatformService],
  exports: [PlatformService],
})
export class PlatformModule {}