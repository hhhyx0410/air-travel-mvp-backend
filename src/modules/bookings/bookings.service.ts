import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationStatus } from '../../common/enums/application-status.enum';
import { BookingStatus } from '../../common/enums/booking-status.enum';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingEntity } from './entities/booking.entity';
import { ApplicationEntity } from '../applications/entities/application.entity';
import { ApplicationLogEntity } from '../applications/entities/application-log.entity';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(BookingEntity)
    private readonly bookingRepository: Repository<BookingEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    @InjectRepository(ApplicationLogEntity)
    private readonly applicationLogRepository: Repository<ApplicationLogEntity>,
  ) {}

  private toNumber(value?: string | number | null) {
    return value == null ? undefined : Number(value);
  }

  async create(applicationId: number, payload: CreateBookingDto) {
    const application = await this.applicationRepository.findOne({ where: { id: applicationId } });
    if (!application) {
      throw new NotFoundException(`Application ${applicationId} not found`);
    }

    const attemptCount = await this.bookingRepository.count({ where: { applicationId } });
    const totalAmount = (payload.ticketPrice ?? 0) + (payload.taxAmount ?? 0) + (payload.serviceFee ?? 0);
    const booking = await this.bookingRepository.save(
      this.bookingRepository.create({
        applicationId,
        attemptNo: attemptCount + 1,
        operatorId: null,
        bookingChannel: payload.bookingChannel,
        airline: payload.airline,
        flightNo: payload.flightNo,
        cabinClass: payload.cabinClass,
        departTime: payload.departTime ? new Date(payload.departTime) : null,
        arriveTime: payload.arriveTime ? new Date(payload.arriveTime) : null,
        ticketStatus: payload.ticketStatus ?? BookingStatus.INIT,
        ticketPrice: payload.ticketPrice != null ? payload.ticketPrice.toFixed(2) : null,
        taxAmount: payload.taxAmount != null ? payload.taxAmount.toFixed(2) : '0.00',
        serviceFee: payload.serviceFee != null ? payload.serviceFee.toFixed(2) : '0.00',
        totalAmount: totalAmount.toFixed(2),
        failureReason: payload.failureReason,
      }),
    );

    application.latestBookingId = Number(booking.id);
    application.actualAmount = totalAmount.toFixed(2);
    application.status =
      booking.ticketStatus === BookingStatus.TICKETED
        ? ApplicationStatus.TICKETED
        : booking.ticketStatus === BookingStatus.FAILED
          ? ApplicationStatus.FAILED
          : ApplicationStatus.BOOKED;
    await this.applicationRepository.save(application);

    await this.applicationLogRepository.save(
      this.applicationLogRepository.create({
        applicationId,
        action: 'CREATE_BOOKING',
        fromStatus: null,
        toStatus: application.status,
        comment: payload.failureReason ?? '订票记录已创建',
      }),
    );

    return {
      id: Number(booking.id),
      applicationId,
      attemptNo: booking.attemptNo,
      bookingChannel: booking.bookingChannel,
      airline: booking.airline,
      flightNo: booking.flightNo,
      cabinClass: booking.cabinClass,
      departTime: booking.departTime,
      arriveTime: booking.arriveTime,
      ticketStatus: booking.ticketStatus,
      ticketPrice: this.toNumber(booking.ticketPrice),
      taxAmount: this.toNumber(booking.taxAmount),
      serviceFee: this.toNumber(booking.serviceFee),
      totalAmount: this.toNumber(booking.totalAmount),
      failureReason: booking.failureReason,
    };
  }

  async findByApplication(applicationId: number) {
    const list = await this.bookingRepository.find({
      where: { applicationId },
      order: { createdAt: 'DESC' },
    });

    return list.map((booking) => ({
      id: Number(booking.id),
      applicationId: Number(booking.applicationId),
      attemptNo: booking.attemptNo,
      bookingChannel: booking.bookingChannel,
      airline: booking.airline,
      flightNo: booking.flightNo,
      cabinClass: booking.cabinClass,
      departTime: booking.departTime,
      arriveTime: booking.arriveTime,
      ticketStatus: booking.ticketStatus,
      ticketPrice: this.toNumber(booking.ticketPrice),
      taxAmount: this.toNumber(booking.taxAmount),
      serviceFee: this.toNumber(booking.serviceFee),
      totalAmount: this.toNumber(booking.totalAmount),
      failureReason: booking.failureReason,
    }));
  }
}
