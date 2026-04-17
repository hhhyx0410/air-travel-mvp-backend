import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ApplicationStatus } from '../../../common/enums/application-status.enum';
import { DepartmentEntity } from '../../departments/entities/department.entity';
import { UserEntity } from '../../users/entities/user.entity';

@Entity({ name: 'travel_applications' })
export class ApplicationEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: number;

  @Column({ name: 'application_no', type: 'varchar', length: 50 })
  applicationNo!: string;

  @Column({ name: 'applicant_id', type: 'bigint', unsigned: true })
  applicantId!: number;

  @ManyToOne(() => UserEntity, { nullable: false })
  @JoinColumn({ name: 'applicant_id' })
  applicant!: UserEntity;

  @Column({ name: 'department_id', type: 'bigint', unsigned: true })
  departmentId!: number;

  @ManyToOne(() => DepartmentEntity, { nullable: false })
  @JoinColumn({ name: 'department_id' })
  department!: DepartmentEntity;

  @Column({ name: 'trip_type', type: 'varchar', length: 20 })
  tripType!: string;

  @Column({ name: 'departure_date', type: 'date' })
  departureDate!: string;

  @Column({ name: 'return_date', type: 'date', nullable: true })
  returnDate?: string | null;

  @Column({ name: 'from_city', type: 'varchar', length: 50 })
  fromCity!: string;

  @Column({ name: 'to_city', type: 'varchar', length: 50 })
  toCity!: string;

  @Column({ name: 'return_from_city', type: 'varchar', length: 50, nullable: true })
  returnFromCity?: string | null;

  @Column({ name: 'return_to_city', type: 'varchar', length: 50, nullable: true })
  returnToCity?: string | null;

  @Column({ type: 'varchar', length: 255 })
  reason!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  remarks?: string | null;

  @Column({ type: 'enum', enum: ApplicationStatus, default: ApplicationStatus.PENDING })
  status!: ApplicationStatus;

  @Column({ name: 'current_handler_id', type: 'bigint', unsigned: true, nullable: true })
  currentHandlerId?: number | null;

  @Column({ name: 'latest_booking_id', type: 'bigint', unsigned: true, nullable: true })
  latestBookingId?: number | null;

  @Column({ name: 'estimated_budget', type: 'decimal', precision: 12, scale: 2, nullable: true })
  estimatedBudget?: string | null;

  @Column({ name: 'actual_amount', type: 'decimal', precision: 12, scale: 2, nullable: true })
  actualAmount?: string | null;

  @Column({ name: 'submitted_at', type: 'datetime' })
  submittedAt!: Date;

  @Column({ name: 'completed_at', type: 'datetime', nullable: true })
  completedAt?: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt!: Date;
}
