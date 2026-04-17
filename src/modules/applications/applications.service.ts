import { Injectable } from '@nestjs/common';
import { ApplicationStatus } from '../../common/enums/application-status.enum';
import { CreateApplicationDto } from './dto/create-application.dto';
import { QueryApplicationsDto } from './dto/query-applications.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { ApplicationEntity } from './entities/application.entity';

@Injectable()
export class ApplicationsService {
  private readonly demoApplication: ApplicationEntity = {
    id: 1001,
    applicationNo: 'TA202604160001',
    applicantId: 1,
    applicantName: '张三',
    departmentName: '市场部',
    tripType: 'ROUND_TRIP',
    departureDate: '2026-04-20',
    returnDate: '2026-04-23',
    fromCity: '上海',
    toCity: '北京',
    returnFromCity: '北京',
    returnToCity: '上海',
    reason: '客户拜访与项目复盘',
    remarks: '优先选择上午航班',
    estimatedBudget: 3200,
    actualAmount: 2860,
    status: ApplicationStatus.PROCESSING,
    submittedAt: '2026-04-16 10:00:00',
  };

  create(payload: CreateApplicationDto) {
    return { ...this.demoApplication, ...payload, status: ApplicationStatus.PENDING };
  }

  myList(query: QueryApplicationsDto) {
    return { list: [this.demoApplication], page: query.page, pageSize: query.pageSize, total: 1 };
  }

  pendingList(query: QueryApplicationsDto) {
    return { list: [this.demoApplication], page: query.page, pageSize: query.pageSize, total: 1 };
  }

  findOne(id: number) {
    return {
      ...this.demoApplication,
      id,
      logs: [
        {
          id: 1,
          action: 'CREATE_APPLICATION',
          fromStatus: null,
          toStatus: ApplicationStatus.PENDING,
          createdAt: '2026-04-16 10:00:00',
          comment: '员工提交申请',
        },
      ],
      bookings: [],
    };
  }

  updateStatus(id: number, payload: UpdateApplicationStatusDto) {
    return { id, status: payload.status, comment: payload.comment ?? '' };
  }
}
