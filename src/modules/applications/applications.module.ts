import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import { ApplicationEntity } from './entities/application.entity';
import { ApplicationLogEntity } from './entities/application-log.entity';
import { BookingEntity } from '../bookings/entities/booking.entity';
import { UserEntity } from '../users/entities/user.entity';
import { DepartmentEntity } from '../departments/entities/department.entity';
import { PlatformModule } from '../platform/platform.module';

@Module({
  imports: [TypeOrmModule.forFeature([ApplicationEntity, ApplicationLogEntity, BookingEntity, UserEntity, DepartmentEntity]), PlatformModule],
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
  exports: [ApplicationsService, TypeOrmModule],
})
export class ApplicationsModule {}