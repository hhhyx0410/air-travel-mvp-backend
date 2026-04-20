export type PlatformRole = 'EMPLOYEE' | 'ADMIN' | 'DEVELOPER';

export type PlatformApprovalStatus = 'APPROVED' | 'PENDING' | 'REJECTED';

export interface PlatformAccount {
  id: number;
  username: string;
  password: string;
  role: PlatformRole;
  approvalStatus: PlatformApprovalStatus;
  employeeNo: string;
  organizationId: number;
  organizationName: string;
  userId: number;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface PlatformSession {
  token: string;
  accountId: number;
  createdAt: string;
}

export interface InquiryMessageRecord {
  id: string;
  senderRole: 'EMPLOYEE' | 'ADMIN';
  senderName: string;
  content: string;
  createdAt: string;
}

export interface InquiryRecord {
  id: string;
  userId: number;
  userName: string;
  userDepartment: string;
  status: 'OPEN' | 'REPLIED' | 'CLOSED';
  subject: string;
  createdAt: string;
  messages: InquiryMessageRecord[];
}

export interface PlatformStore {
  nextAccountId: number;
  accounts: PlatformAccount[];
  sessions: PlatformSession[];
  inquiries: InquiryRecord[];
}
