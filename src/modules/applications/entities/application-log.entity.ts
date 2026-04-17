import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApplicationStatus } from '../../../common/enums/application-status.enum';

@Entity({ name: 'application_logs' })
export class ApplicationLogEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: number;

  @Column({ name: 'application_id', type: 'bigint', unsigned: true })
  applicationId!: number;

  @Column({ name: 'operator_id', type: 'bigint', unsigned: true, nullable: true })
  operatorId?: number | null;

  @Column({ type: 'varchar', length: 50 })
  action!: string;

  @Column({ name: 'from_status', type: 'enum', enum: ApplicationStatus, nullable: true })
  fromStatus?: ApplicationStatus | null;

  @Column({ name: 'to_status', type: 'enum', enum: ApplicationStatus, nullable: true })
  toStatus?: ApplicationStatus | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  comment?: string | null;

  @Column({ name: 'extra_data', type: 'json', nullable: true })
  extraData?: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt!: Date;
}
