import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { BookingEntity } from './entities/booking.entity';
import { ApplicationEntity } from '../applications/entities/application.entity';
import { ApplicationLogEntity } from '../applications/entities/application-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BookingEntity, ApplicationEntity, ApplicationLogEntity])],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
