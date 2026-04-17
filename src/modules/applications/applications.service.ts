import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationStatus } from '../../common/enums/application-status.enum';
import { CreateApplicationDto } from './dto/create-application.dto';
import { QueryApplicationsDto } from './dto/query-applications.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { ApplicationEntity } from './entities/application.entity';
import { UserEntity } from '../users/entities/user.entity';
import { DepartmentEntity } from '../departments/entities/department.entity';
import { ApplicationLogEntity } from './entities/application-log.entity';
import { BookingEntity } from '../bookings/entities/booking.entity';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(DepartmentEntity)
    private readonly departmentRepository: Repository<DepartmentEntity>,
    @InjectRepository(ApplicationLogEntity)
    private readonly applicationLogRepository: Repository<ApplicationLogEntity>,
    @InjectRepository(BookingEntity)
    private readonly bookingRepository: Repository<BookingEntity>,
  ) {}

  private toNumber(value?: string | number | null) {
    return value == null ? undefined : Number(value);
  }

  private mapApplication(entity: ApplicationEntity) {
    return {
      id: Number(entity.id),
      applicationNo: entity.applicationNo,
      applicantId: Number(entity.applicantId),
      applicantName: entity.applicant?.name ?? '',
      departmentName: entity.department?.name ?? '',
      tripType: entity.tripType,
      departureDate: entity.departureDate,
      returnDate: entity.returnDate ?? undefined,
      fromCity: entity.fromCity,
      toCity: entity.toCity,
      returnFromCity: entity.returnFromCity ?? undefined,
      returnToCity: entity.returnToCity ?? undefined,
      reason: entity.reason,
      remarks: entity.remarks ?? undefined,
      estimatedBudget: this.toNumber(entity.estimatedBudget),
      actualAmount: this.toNumber(entity.actualAmount),
      status: entity.status,
      submittedAt: entity.submittedAt,
    };
  }

  async create(payload: CreateApplicationDto) {
    const applicant = await this.userRepository.findOne({
      where: { employeeNo: 'E10001' },
      relations: ['department'],
    });

    if (!applicant) {
      throw new NotFoundException('Default applicant not found. Please insert user E10001 first.');
    }

    const applicationNo = `TA${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${Date.now().toString().slice(-4)}`;

    const application = this.applicationRepository.create({
      applicationNo,
      applicantId: Number(applicant.id),
      departmentId: Number(applicant.departmentId),
      tripType: payload.tripType,
      departureDate: payload.departureDate,
      returnDate: payload.returnDate,
      fromCity: payload.fromCity,
      toCity: payload.toCity,
      returnFromCity: payload.returnFromCity,
      returnToCity: payload.returnToCity,
      reason: payload.reason,
      remarks: payload.remarks,
      estimatedBudget: payload.estimatedBudget != null ? payload.estimatedBudget.toFixed(2) : null,
      actualAmount: null,
      status: ApplicationStatus.PENDING,
      submittedAt: new Date(),
    });

    const saved = await this.applicationRepository.save(application);
    await this.applicationLogRepository.save(
      this.applicationLogRepository.create({
        applicationId: Number(saved.id),
        operatorId: Number(applicant.id),
        action: 'CREATE_APPLICATION',
        fromStatus: null,
        toStatus: ApplicationStatus.PENDING,
        comment: '员工提交申请',
      }),
    );

    const detail = await this.applicationRepository.findOne({
      where: { id: Number(saved.id) },
      relations: ['applicant', 'department'],
    });

    return this.mapApplication(detail!);
  }

  async myList(query: QueryApplicationsDto) {
    const applicant = await this.userRepository.findOne({ where: { employeeNo: 'E10001' } });
    if (!applicant) {
      throw new NotFoundException('Default applicant not found. Please insert user E10001 first.');
    }

    const queryBuilder = this.applicationRepository
      .createQueryBuilder('application')
      .leftJoinAndSelect('application.applicant', 'applicant')
      .leftJoinAndSelect('application.department', 'department')
      .where('application.applicantId = :applicantId', { applicantId: applicant.id });

    if (query.status) {
      queryBuilder.andWhere('application.status = :status', { status: query.status });
    }

    queryBuilder
      .orderBy('application.submittedAt', 'DESC')
      .skip((query.page - 1) * query.pageSize)
      .take(query.pageSize);

    const [list, total] = await queryBuilder.getManyAndCount();

    return {
      list: list.map((item) => this.mapApplication(item)),
      page: query.page,
      pageSize: query.pageSize,
      total,
    };
  }

  async pendingList(query: QueryApplicationsDto) {
    const queryBuilder = this.applicationRepository
      .createQueryBuilder('application')
      .leftJoinAndSelect('application.applicant', 'applicant')
      .leftJoinAndSelect('application.department', 'department');

    if (query.status) {
      queryBuilder.where('application.status = :status', { status: query.status });
    } else {
      queryBuilder.where('application.status IN (:...statuses)', {
        statuses: [ApplicationStatus.PENDING, ApplicationStatus.PROCESSING, ApplicationStatus.SUPPLEMENT],
      });
    }

    queryBuilder
      .orderBy('application.submittedAt', 'DESC')
      .skip((query.page - 1) * query.pageSize)
      .take(query.pageSize);

    const [list, total] = await queryBuilder.getManyAndCount();

    return {
      list: list.map((item) => this.mapApplication(item)),
      page: query.page,
      pageSize: query.pageSize,
      total,
    };
  }

  async findOne(id: number) {
    const detail = await this.applicationRepository.findOne({
      where: { id },
      relations: ['applicant', 'department'],
    });

    if (!detail) {
      throw new NotFoundException(`Application ${id} not found`);
    }

    const [logs, bookings] = await Promise.all([
      this.applicationLogRepository.find({
        where: { applicationId: id },
        order: { createdAt: 'DESC' },
      }),
      this.bookingRepository.find({
        where: { applicationId: id },
        order: { createdAt: 'DESC' },
      }),
    ]);

    return {
      ...this.mapApplication(detail),
      logs: logs.map((log) => ({
        id: Number(log.id),
        action: log.action,
        fromStatus: log.fromStatus,
        toStatus: log.toStatus,
        comment: log.comment,
        createdAt: log.createdAt,
      })),
      bookings: bookings.map((booking) => ({
        id: Number(booking.id),
        applicationId: Number(booking.applicationId),
        attemptNo: booking.attemptNo,
        bookingChannel: booking.bookingChannel,
        airline: booking.airline,
        flightNo: booking.flightNo,
        ticketStatus: booking.ticketStatus,
        ticketPrice: this.toNumber(booking.ticketPrice),
        taxAmount: this.toNumber(booking.taxAmount),
        serviceFee: this.toNumber(booking.serviceFee),
        totalAmount: this.toNumber(booking.totalAmount),
        failureReason: booking.failureReason,
      })),
    };
  }

  async updateStatus(id: number, payload: UpdateApplicationStatusDto) {
    const detail = await this.applicationRepository.findOne({ where: { id } });
    if (!detail) {
      throw new NotFoundException(`Application ${id} not found`);
    }

    const fromStatus = detail.status;
    detail.status = payload.status;
    if (payload.status === ApplicationStatus.COMPLETED) {
      detail.completedAt = new Date();
    }
    await this.applicationRepository.save(detail);
    await this.applicationLogRepository.save(
      this.applicationLogRepository.create({
        applicationId: id,
        action: 'CHANGE_STATUS',
        fromStatus,
        toStatus: payload.status,
        comment: payload.comment ?? '',
      }),
    );

    return {
      id,
      status: payload.status,
      comment: payload.comment ?? '',
    };
  }
}
