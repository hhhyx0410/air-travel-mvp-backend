import { Injectable } from '@nestjs/common';
import { BookingStatus } from '../../common/enums/booking-status.enum';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  create(applicationId: number, payload: CreateBookingDto) {
    return {
      id: 1,
      applicationId,
      attemptNo: 1,
      ...payload,
      ticketStatus: payload.ticketStatus ?? BookingStatus.INIT,
      totalAmount: (payload.ticketPrice ?? 0) + (payload.taxAmount ?? 0) + (payload.serviceFee ?? 0),
    };
  }

  findByApplication(applicationId: number) {
    return [
      {
        id: 1,
        applicationId,
        attemptNo: 1,
        ticketStatus: BookingStatus.BOOKED,
        ticketPrice: 2400,
        taxAmount: 260,
        serviceFee: 200,
        totalAmount: 2860,
      },
    ];
  }
}
