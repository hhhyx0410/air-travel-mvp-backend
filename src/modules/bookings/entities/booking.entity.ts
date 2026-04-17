import { BookingStatus } from '../../../common/enums/booking-status.enum';

export class BookingEntity {
  id!: number;
  applicationId!: number;
  attemptNo!: number;
  bookingChannel?: string;
  airline?: string;
  flightNo?: string;
  cabinClass?: string;
  departTime?: string;
  arriveTime?: string;
  ticketStatus!: BookingStatus;
  ticketPrice?: number;
  taxAmount?: number;
  serviceFee?: number;
  totalAmount?: number;
  failureReason?: string;
}
