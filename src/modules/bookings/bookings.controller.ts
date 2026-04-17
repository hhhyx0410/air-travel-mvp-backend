import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Controller()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post('applications/:id/bookings')
  create(@Param('id', ParseIntPipe) applicationId: number, @Body() payload: CreateBookingDto) {
    return { code: 0, message: 'ok', data: this.bookingsService.create(applicationId, payload) };
  }

  @Get('applications/:id/bookings')
  findByApplication(@Param('id', ParseIntPipe) applicationId: number) {
    return { code: 0, message: 'ok', data: this.bookingsService.findByApplication(applicationId) };
  }
}
