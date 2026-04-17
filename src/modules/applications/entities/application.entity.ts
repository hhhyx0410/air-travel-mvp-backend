import { ApplicationStatus } from '../../../common/enums/application-status.enum';

export class ApplicationEntity {
  id!: number;
  applicationNo!: string;
  applicantId!: number;
  applicantName!: string;
  departmentName!: string;
  tripType!: string;
  departureDate!: string;
  returnDate?: string;
  fromCity!: string;
  toCity!: string;
  returnFromCity?: string;
  returnToCity?: string;
  reason!: string;
  remarks?: string;
  estimatedBudget?: number;
  actualAmount?: number;
  status!: ApplicationStatus;
  submittedAt!: string;
}
