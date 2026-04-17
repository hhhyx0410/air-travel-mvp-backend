import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { BookingStatus } from '../../../common/enums/booking-status.enum';

export class CreateBookingDto {
  @IsString()
  @IsOptional()
  bookingChannel?: string;

  @IsString()
  @IsOptional()
  airline?: string;

  @IsString()
  @IsOptional()
  flightNo?: string;

  @IsString()
  @IsOptional()
  cabinClass?: string;

  @IsOptional()
  @IsDateString()
  departTime?: string;

  @IsOptional()
  @IsDateString()
  arriveTime?: string;

  @IsEnum(BookingStatus)
  ticketStatus!: BookingStatus;

  @IsOptional()
  @IsNumber()
  ticketPrice?: number;

  @IsOptional()
  @IsNumber()
  taxAmount?: number;

  @IsOptional()
  @IsNumber()
  serviceFee?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  failureReason?: string;
}
