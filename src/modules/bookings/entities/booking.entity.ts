import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { BookingStatus } from '../../../common/enums/booking-status.enum';
import { ApplicationEntity } from '../../applications/entities/application.entity';
import { UserEntity } from '../../users/entities/user.entity';

@Entity({ name: 'ticket_bookings' })
export class BookingEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: number;

  @Column({ name: 'application_id', type: 'bigint', unsigned: true })
  applicationId!: number;

  @ManyToOne(() => ApplicationEntity, { nullable: false })
  @JoinColumn({ name: 'application_id' })
  application!: ApplicationEntity;

  @Column({ name: 'attempt_no', type: 'int' })
  attemptNo!: number;

  @Column({ name: 'operator_id', type: 'bigint', unsigned: true, nullable: true })
  operatorId?: number | null;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'operator_id' })
  operator?: UserEntity | null;

  @Column({ name: 'booking_channel', type: 'varchar', length: 50, nullable: true })
  bookingChannel?: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  airline?: string | null;

  @Column({ name: 'flight_no', type: 'varchar', length: 30, nullable: true })
  flightNo?: string | null;

  @Column({ name: 'cabin_class', type: 'varchar', length: 30, nullable: true })
  cabinClass?: string | null;

  @Column({ name: 'depart_time', type: 'datetime', nullable: true })
  departTime?: Date | null;

  @Column({ name: 'arrive_time', type: 'datetime', nullable: true })
  arriveTime?: Date | null;

  @Column({ name: 'ticket_status', type: 'enum', enum: BookingStatus, default: BookingStatus.INIT })
  ticketStatus!: BookingStatus;

  @Column({ name: 'ticket_price', type: 'decimal', precision: 12, scale: 2, nullable: true })
  ticketPrice?: string | null;

  @Column({ name: 'tax_amount', type: 'decimal', precision: 12, scale: 2, nullable: true })
  taxAmount?: string | null;

  @Column({ name: 'service_fee', type: 'decimal', precision: 12, scale: 2, nullable: true })
  serviceFee?: string | null;

  @Column({ name: 'total_amount', type: 'decimal', precision: 12, scale: 2, nullable: true })
  totalAmount?: string | null;

  @Column({ name: 'failure_reason', type: 'varchar', length: 255, nullable: true })
  failureReason?: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt!: Date;
}
