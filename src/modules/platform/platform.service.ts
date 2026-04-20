import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';
import { promises as fs } from 'fs';
import * as path from 'path';
import { Repository } from 'typeorm';
import { UserRole } from '../../common/enums/user-role.enum';
import { DepartmentEntity } from '../departments/entities/department.entity';
import { UserEntity } from '../users/entities/user.entity';
import { InquiryRecord, PlatformAccount, PlatformRole, PlatformStore } from './platform.types';

const STORE_DIR = path.join(process.cwd(), 'data');
const STORE_FILE = path.join(STORE_DIR, 'platform-store.json');
const DEFAULT_ORGANIZATION_NAME = '未加入组织';
const STATUS_TEXT: Record<string, string> = {
  OPEN: '待回复',
  REPLIED: '已回复',
  CLOSED: '已关闭',
};

@Injectable()
export class PlatformService {
  private initializePromise?: Promise<void>;

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(DepartmentEntity)
    private readonly departmentRepository: Repository<DepartmentEntity>,
  ) {}

  private mapRoleToDbRole(role: PlatformRole): UserRole {
    return role === 'EMPLOYEE' ? UserRole.EMPLOYEE : UserRole.ADMIN;
  }

  private createToken() {
    return `pt_${randomBytes(24).toString('hex')}`;
  }

  private createInquiryId() {
    return `inq_${Date.now()}_${randomBytes(3).toString('hex')}`;
  }

  private createMessageId() {
    return `msg_${Date.now()}_${randomBytes(3).toString('hex')}`;
  }

  private async ensureInitialized() {
    if (!this.initializePromise) {
      this.initializePromise = this.initialize();
    }
    await this.initializePromise;
  }

  private async initialize() {
    await fs.mkdir(STORE_DIR, { recursive: true });
    try {
      await fs.access(STORE_FILE);
    } catch {
      const initialStore: PlatformStore = { nextAccountId: 4, accounts: [], sessions: [], inquiries: [] };
      await fs.writeFile(STORE_FILE, JSON.stringify(initialStore, null, 2), 'utf8');
    }

    const store = await this.readStore();
    if (!store.accounts.length) {
      const marketing = await this.ensureDepartment('市场部', 'ORG_MARKETING');
      const ops = await this.ensureDepartment('平台运营中心', 'ORG_PLATFORM_OPS');
      const dev = await this.ensureDepartment('研发组', 'ORG_DEVELOPMENT');
      const now = '2026-04-17T00:00:00.000Z';
      const demoUser = await this.ensureUser('E0001', 'demo', Number(marketing.id), this.mapRoleToDbRole('EMPLOYEE'));
      const adminUser = await this.ensureUser('A0001', 'admin', Number(ops.id), this.mapRoleToDbRole('ADMIN'));
      const developerUser = await this.ensureUser('D0001', 'developer', Number(dev.id), this.mapRoleToDbRole('DEVELOPER'));
      store.accounts = [
        { id: 1, username: 'demo', password: 'demo123', role: 'EMPLOYEE', approvalStatus: 'APPROVED', employeeNo: 'E0001', organizationId: Number(marketing.id), organizationName: marketing.name, userId: Number(demoUser.id), createdAt: now },
        { id: 2, username: 'admin', password: 'admin123', role: 'ADMIN', approvalStatus: 'APPROVED', employeeNo: 'A0001', organizationId: Number(ops.id), organizationName: ops.name, userId: Number(adminUser.id), createdAt: now },
        { id: 3, username: 'developer', password: 'developer123', role: 'DEVELOPER', approvalStatus: 'APPROVED', employeeNo: 'D0001', organizationId: Number(dev.id), organizationName: dev.name, userId: Number(developerUser.id), createdAt: now },
      ];
      await this.writeStore(store);
      return;
    }

    let changed = false;
    for (const account of store.accounts) {
      let department = account.organizationId
        ? await this.departmentRepository.findOne({ where: { id: account.organizationId } })
        : null;
      if (account.organizationId && !department) {
        department = await this.ensureDepartment(account.organizationName || `组织${account.organizationId}`, `ORG_RESTORE_${account.organizationId}`);
        account.organizationId = Number(department.id);
        account.organizationName = department.name;
        changed = true;
      }
      const user = await this.ensureUser(account.employeeNo, account.username, account.organizationId || null, this.mapRoleToDbRole(account.role));
      if (account.userId !== Number(user.id)) {
        account.userId = Number(user.id);
        changed = true;
      }
    }

    if (changed) {
      await this.writeStore(store);
    }
  }

  private async readStore(): Promise<PlatformStore> {
    const raw = await fs.readFile(STORE_FILE, 'utf8');
    const parsed = JSON.parse(raw) as PlatformStore;
    return {
      nextAccountId: parsed.nextAccountId || 1,
      accounts: parsed.accounts || [],
      sessions: parsed.sessions || [],
      inquiries: parsed.inquiries || [],
    };
  }

  private async writeStore(store: PlatformStore) {
    await fs.writeFile(STORE_FILE, JSON.stringify(store, null, 2), 'utf8');
  }

  private async ensureDepartment(name: string, code: string) {
    let department = await this.departmentRepository.findOne({ where: [{ code }, { name }] });
    if (!department) {
      department = this.departmentRepository.create({ name, code, parentId: null, status: 1 });
      department = await this.departmentRepository.save(department);
    } else if (!department.status) {
      department.status = 1;
      department.name = name;
      department = await this.departmentRepository.save(department);
    }
    return department;
  }

  private async ensureUser(employeeNo: string, username: string, departmentId: number | null, role: UserRole) {
    let user = await this.userRepository.findOne({ where: { employeeNo } });
    if (!user) {
      user = this.userRepository.create({ employeeNo, name: username, departmentId, role, status: 1 });
    } else {
      user.name = username;
      user.departmentId = departmentId;
      user.role = role;
      user.status = 1;
    }
    return this.userRepository.save(user);
  }

  private buildProfile(account: PlatformAccount, pendingAdminCount = 0, organizationMemberCount = 0) {
    return {
      id: account.id,
      employeeNo: account.employeeNo,
      name: account.username,
      role: account.role,
      departmentName: account.organizationName || DEFAULT_ORGANIZATION_NAME,
      organizationId: account.organizationId || 0,
      approvalStatus: account.approvalStatus,
      reviewerRole: account.role === 'ADMIN' ? 'DEVELOPER' : null,
      hasOrganization: !!account.organizationId,
      pendingAdminCount,
      organizationMemberCount,
    };
  }

  private async getStoreAndAccount(token?: string, allowMissing = false) {
    await this.ensureInitialized();
    const store = await this.readStore();
    if (!token) {
      if (allowMissing) return { store, account: null as PlatformAccount | null };
      throw new UnauthorizedException('请先登录');
    }
    const session = store.sessions.find((item) => item.token === token);
    if (!session) {
      if (allowMissing) return { store, account: null as PlatformAccount | null };
      throw new UnauthorizedException('登录已失效，请重新登录');
    }
    const account = store.accounts.find((item) => item.id === session.accountId);
    if (!account) {
      if (allowMissing) return { store, account: null as PlatformAccount | null };
      throw new UnauthorizedException('当前账号不存在');
    }
    return { store, account };
  }

  async getCurrentAccount(token?: string) {
    const { account } = await this.getStoreAndAccount(token);
    return account;
  }

  async getProfile(token?: string) {
    const { store, account } = await this.getStoreAndAccount(token, true);
    if (!account) return null;
    const pendingAdminCount = account.role === 'DEVELOPER'
      ? store.accounts.filter((item) => item.role === 'ADMIN' && item.approvalStatus === 'PENDING').length
      : 0;
    const organizationMemberCount = account.organizationId
      ? store.accounts.filter((item) => item.organizationId === account.organizationId).length
      : 0;
    return this.buildProfile(account, pendingAdminCount, organizationMemberCount);
  }

  async login(username: string, password: string) {
    const normalized = String(username || '').trim().toLowerCase();
    if (!normalized) throw new BadRequestException('请输入用户名');
    if (String(password || '').length < 6) throw new BadRequestException('密码至少需要 6 位');
    const { store } = await this.getStoreAndAccount(undefined, true);
    const account = store.accounts.find((item) => item.username.toLowerCase() === normalized);
    if (!account) throw new NotFoundException('未找到该账号，请先注册');
    if (account.password !== String(password || '')) throw new BadRequestException('密码错误，请重新输入');
    if (account.role === 'ADMIN' && account.approvalStatus === 'PENDING') {
      throw new BadRequestException('管理员账号申请已推送至开发者审核队列，请等待开发者审核通过后再登录');
    }
    if (account.approvalStatus === 'REJECTED') {
      throw new BadRequestException('该账号审核未通过，请重新注册');
    }
    store.sessions = store.sessions.filter((item) => item.accountId !== account.id);
    const token = this.createToken();
    store.sessions.push({ token, accountId: account.id, createdAt: new Date().toISOString() });
    await this.writeStore(store);
    return { token, profile: await this.getProfile(token) };
  }

  async logout(token?: string) {
    if (!token) return true;
    const { store } = await this.getStoreAndAccount(token, true);
    store.sessions = store.sessions.filter((item) => item.token !== token);
    await this.writeStore(store);
    return true;
  }

  async fetchOrganizations(token?: string) {
    const profile = await this.getProfile(token);
    const departments = await this.departmentRepository.find({ where: { status: 1 }, order: { id: 'ASC' } });
    const { store } = await this.getStoreAndAccount(token, true);
    return departments.map((item) => ({
      id: Number(item.id),
      name: item.name,
      memberCount: store.accounts.filter((account) => account.organizationId === Number(item.id)).length,
      isCurrent: !!profile && profile.organizationId === Number(item.id),
    }));
  }

  async registerAccount(payload: { username: string; password: string; confirmPassword: string; role: PlatformRole; organizationId?: number; organizationMode?: 'EXISTING' | 'NEW'; newOrganization?: string; }) {
    const username = String(payload.username || '').trim();
    const password = String(payload.password || '');
    const confirmPassword = String(payload.confirmPassword || '');
    const role: PlatformRole = payload.role === 'ADMIN' ? 'ADMIN' : 'EMPLOYEE';
    if (!username) throw new BadRequestException('请输入用户名');
    if (password.length < 6) throw new BadRequestException('密码至少需要 6 位');
    if (password !== confirmPassword) throw new BadRequestException('两次输入的密码不一致');
    await this.ensureInitialized();
    const store = await this.readStore();
    if (store.accounts.some((item) => item.username.toLowerCase() === username.toLowerCase())) {
      throw new BadRequestException('用户名已存在，请更换后重试');
    }

    let organizationId = Number(payload.organizationId || 0);
    let organizationName = '';
    if (role === 'EMPLOYEE') {
      if (!organizationId) throw new BadRequestException('请选择要加入的组织');
      const target = await this.departmentRepository.findOne({ where: { id: organizationId, status: 1 } });
      if (!target) throw new NotFoundException('未找到目标组织');
      organizationName = target.name;
    } else {
      if (payload.organizationMode === 'NEW') {
        const newName = String(payload.newOrganization || '').trim();
        if (!newName) throw new BadRequestException('请输入新组织名称');
        const existing = await this.departmentRepository.findOne({ where: { name: newName } });
        const department = existing ?? await this.departmentRepository.save(this.departmentRepository.create({ name: newName, code: `ORG_${Date.now()}`, parentId: null, status: 1 }));
        organizationId = Number(department.id);
        organizationName = department.name;
      } else if (organizationId) {
        const target = await this.departmentRepository.findOne({ where: { id: organizationId, status: 1 } });
        if (!target) throw new NotFoundException('未找到目标组织');
        organizationName = target.name;
      } else {
        throw new BadRequestException('请选择组织或创建新组织');
      }
    }

    const nextId = store.nextAccountId || store.accounts.length + 1;
    const employeeNo = `${role === 'ADMIN' ? 'A' : 'E'}${String(nextId).padStart(4, '0')}`;
    const user = await this.ensureUser(employeeNo, username, organizationId || null, this.mapRoleToDbRole(role));
    const account: PlatformAccount = {
      id: nextId,
      username,
      password,
      role,
      approvalStatus: role === 'ADMIN' ? 'PENDING' : 'APPROVED',
      employeeNo,
      organizationId: organizationId || 0,
      organizationName,
      userId: Number(user.id),
      createdAt: new Date().toISOString(),
    };
    store.nextAccountId = nextId + 1;
    store.accounts.unshift(account);
    await this.writeStore(store);
    if (role === 'ADMIN') {
      return { token: null, profile: null };
    }
    const token = this.createToken();
    store.sessions.push({ token, accountId: account.id, createdAt: new Date().toISOString() });
    await this.writeStore(store);
    return { token, profile: await this.getProfile(token) };
  }

  private assertDeveloper(account: PlatformAccount) {
    if (account.role !== 'DEVELOPER') throw new UnauthorizedException('仅开发者可审核管理员账号');
  }

  async fetchPendingAdminAccounts(token?: string) {
    const { store, account } = await this.getStoreAndAccount(token);
    this.assertDeveloper(account);
    return store.accounts.filter((item) => item.role === 'ADMIN' && item.approvalStatus === 'PENDING').map((item) => ({
      id: item.id,
      username: item.username,
      organization: item.organizationName || DEFAULT_ORGANIZATION_NAME,
      employeeNo: item.employeeNo,
      createdAt: item.createdAt,
      reviewTarget: 'developer',
    }));
  }

  async fetchAdminApprovalHistory(token?: string) {
    const { store, account } = await this.getStoreAndAccount(token);
    this.assertDeveloper(account);
    return store.accounts.filter((item) => item.role === 'ADMIN' && item.approvalStatus !== 'PENDING').sort((a, b) => String(b.reviewedAt || b.createdAt).localeCompare(String(a.reviewedAt || a.createdAt))).map((item) => ({
      id: item.id,
      username: item.username,
      organization: item.organizationName || DEFAULT_ORGANIZATION_NAME,
      employeeNo: item.employeeNo,
      approvalStatus: item.approvalStatus,
      reviewedAt: item.reviewedAt || '--',
      reviewedBy: item.reviewedBy || '--',
      createdAt: item.createdAt,
    }));
  }

  async approveAdminAccount(token: string | undefined, id: number) {
    const { store, account } = await this.getStoreAndAccount(token);
    this.assertDeveloper(account);
    const target = store.accounts.find((item) => item.id === id && item.role === 'ADMIN');
    if (!target) throw new NotFoundException('未找到待审核账号');
    target.approvalStatus = 'APPROVED';
    target.reviewedAt = new Date().toISOString();
    target.reviewedBy = account.username;
    await this.writeStore(store);
    return this.buildProfile(target);
  }

  async rejectAdminAccount(token: string | undefined, id: number) {
    const { store, account } = await this.getStoreAndAccount(token);
    this.assertDeveloper(account);
    const target = store.accounts.find((item) => item.id === id && item.role === 'ADMIN');
    if (!target) throw new NotFoundException('未找到待审核账号');
    target.approvalStatus = 'REJECTED';
    target.reviewedAt = new Date().toISOString();
    target.reviewedBy = account.username;
    await this.writeStore(store);
    return this.buildProfile(target);
  }

  async fetchOrganizationMembers(token?: string, organizationId?: number) {
    const profile = await this.getProfile(token);
    if (!profile) throw new UnauthorizedException('请先登录');
    const targetOrganizationId = Number(organizationId || profile.organizationId || 0);
    if (!targetOrganizationId) return [];
    const { store } = await this.getStoreAndAccount(token, true);
    return store.accounts.filter((item) => item.organizationId === targetOrganizationId).map((item) => ({
      id: item.id,
      username: item.username,
      employeeNo: item.employeeNo,
      role: item.role,
      approvalStatus: item.approvalStatus,
      organization: item.organizationName,
      isCurrentUser: item.id === profile.id,
    }));
  }

  async joinOrganization(token: string | undefined, organizationId: number) {
    const { store, account } = await this.getStoreAndAccount(token);
    const target = await this.departmentRepository.findOne({ where: { id: organizationId, status: 1 } });
    if (!target) throw new NotFoundException('未找到目标组织');
    account.organizationId = Number(target.id);
    account.organizationName = target.name;
    await this.userRepository.update({ id: account.userId }, { departmentId: Number(target.id) });
    await this.writeStore(store);
    return this.getProfile(token);
  }

  async leaveCurrentOrganization(token?: string) {
    const { store, account } = await this.getStoreAndAccount(token);
    account.organizationId = 0;
    account.organizationName = '';
    await this.userRepository.update({ id: account.userId }, { departmentId: null });
    await this.writeStore(store);
    return this.getProfile(token);
  }

  async createOrganization(token: string | undefined, name: string) {
    const { store, account } = await this.getStoreAndAccount(token);
    if (!['ADMIN', 'DEVELOPER'].includes(account.role)) throw new UnauthorizedException('仅管理员或开发者可创建组织');
    const normalizedName = String(name || '').trim();
    if (!normalizedName) throw new BadRequestException('请输入组织名称');
    const existing = await this.departmentRepository.findOne({ where: { name: normalizedName } });
    if (existing && existing.status === 1) throw new BadRequestException('该组织已存在');
    const department = existing ?? this.departmentRepository.create({ name: normalizedName, code: `ORG_${Date.now()}`, parentId: null, status: 1 });
    department.name = normalizedName;
    department.status = 1;
    const saved = await this.departmentRepository.save(department);
    account.organizationId = Number(saved.id);
    account.organizationName = saved.name;
    await this.userRepository.update({ id: account.userId }, { departmentId: Number(saved.id) });
    await this.writeStore(store);
    return { id: Number(saved.id), name: saved.name, profile: await this.getProfile(token) };
  }

  async deleteOrganization(token: string | undefined, organizationId: number) {
    const { store, account } = await this.getStoreAndAccount(token);
    if (!['ADMIN', 'DEVELOPER'].includes(account.role)) throw new UnauthorizedException('仅管理员或开发者可删除组织');
    if (account.role === 'ADMIN' && account.organizationId !== organizationId) {
      throw new UnauthorizedException('管理员只能删除自己当前所在的组织');
    }
    const target = await this.departmentRepository.findOne({ where: { id: organizationId, status: 1 } });
    if (!target) throw new NotFoundException('未找到目标组织');
    let affectedCount = 0;
    for (const item of store.accounts) {
      if (item.organizationId === organizationId) {
        item.organizationId = 0;
        item.organizationName = '';
        affectedCount += 1;
        await this.userRepository.update({ id: item.userId }, { departmentId: null });
      }
    }
    target.status = 0;
    await this.departmentRepository.save(target);
    await this.writeStore(store);
    return { deletedOrganizationName: target.name, affectedCount, profile: await this.getProfile(token) };
  }

  async fetchEligibleReviewers(token: string | undefined, organizationId: number) {
    const profile = await this.getProfile(token);
    if (!profile) throw new UnauthorizedException('请先登录');
    if (!organizationId) return [];
    const { store } = await this.getStoreAndAccount(token, true);
    return store.accounts.filter((item) => item.organizationId === organizationId && item.approvalStatus === 'APPROVED').map((item) => ({
      id: item.id,
      value: String(item.id),
      label: `${item.username}（${item.role === 'ADMIN' ? '管理员' : item.role === 'DEVELOPER' ? '开发者' : '普通用户'}）`,
      role: item.role,
      organization: item.organizationName || DEFAULT_ORGANIZATION_NAME,
      isCurrentUser: item.id === profile.id,
    }));
  }

  private isPrivileged(account: PlatformAccount) {
    return ['ADMIN', 'DEVELOPER'].includes(account.role);
  }

  private canDeleteInquiry(account: PlatformAccount, inquiry: InquiryRecord) {
    return this.isPrivileged(account) || inquiry.userId === account.id;
  }

  private canDeleteMessage(account: PlatformAccount, inquiry: InquiryRecord, messageId: string) {
    const message = inquiry.messages.find((item) => item.id === messageId);
    if (!message || inquiry.messages.length <= 1) return false;
    if (this.isPrivileged(account)) return true;
    return inquiry.userId === account.id && message.senderRole !== 'ADMIN';
  }

  private deriveInquiryStatus(inquiry: InquiryRecord) {
    if (inquiry.status === 'CLOSED') return 'CLOSED';
    const lastMessage = inquiry.messages[inquiry.messages.length - 1];
    if (!lastMessage) return 'OPEN';
    return lastMessage.senderRole === 'ADMIN' ? 'REPLIED' : 'OPEN';
  }

  private normalizeInquiry(inquiry: InquiryRecord, account: PlatformAccount) {
    const lastMessage = inquiry.messages[inquiry.messages.length - 1];
    return {
      ...inquiry,
      canDelete: this.canDeleteInquiry(account, inquiry),
      statusText: STATUS_TEXT[inquiry.status] || inquiry.status,
      latestMessage: lastMessage ? lastMessage.content : '',
      latestAt: lastMessage ? lastMessage.createdAt : inquiry.createdAt,
      messages: inquiry.messages.map((message) => ({ ...message, canDelete: this.canDeleteMessage(account, inquiry, message.id) })),
    };
  }

  async fetchMyInquiries(token?: string) {
    const { store, account } = await this.getStoreAndAccount(token);
    return store.inquiries.filter((item) => item.userId === account.id).map((item) => this.normalizeInquiry(item, account)).sort((a, b) => String(b.latestAt).localeCompare(String(a.latestAt)));
  }

  async fetchAllInquiries(token?: string) {
    const { store, account } = await this.getStoreAndAccount(token);
    return store.inquiries.map((item) => this.normalizeInquiry(item, account)).sort((a, b) => String(b.latestAt).localeCompare(String(a.latestAt)));
  }

  async createInquiry(token: string | undefined, payload: { content: string; subject?: string }) {
    const { store, account } = await this.getStoreAndAccount(token);
    const content = String(payload.content || '').trim();
    if (content.length < 4) throw new BadRequestException('咨询内容至少 4 个字');
    const now = new Date().toISOString();
    const inquiry: InquiryRecord = {
      id: this.createInquiryId(),
      userId: account.id,
      userName: account.username,
      userDepartment: account.organizationName || DEFAULT_ORGANIZATION_NAME,
      status: 'OPEN',
      subject: String(payload.subject || content || '咨询').trim().slice(0, 24),
      createdAt: now,
      messages: [{ id: this.createMessageId(), senderRole: 'EMPLOYEE', senderName: account.username, content, createdAt: now }],
    };
    store.inquiries.unshift(inquiry);
    await this.writeStore(store);
    return this.normalizeInquiry(inquiry, account);
  }

  async fetchInquiryDetail(token: string | undefined, id: string) {
    const { store, account } = await this.getStoreAndAccount(token);
    const inquiry = store.inquiries.find((item) => item.id === id);
    if (!inquiry) throw new NotFoundException('未找到该咨询记录');
    return this.normalizeInquiry(inquiry, account);
  }

  async replyInquiry(token: string | undefined, id: string, content: string) {
    const { store, account } = await this.getStoreAndAccount(token);
    const inquiry = store.inquiries.find((item) => item.id === id);
    if (!inquiry) throw new NotFoundException('未找到该咨询记录');
    const normalized = String(content || '').trim();
    if (!normalized) throw new BadRequestException('请输入回复内容');
    const senderRole = this.isPrivileged(account) ? 'ADMIN' : 'EMPLOYEE';
    inquiry.messages.push({ id: this.createMessageId(), senderRole, senderName: account.username, content: normalized, createdAt: new Date().toISOString() });
    inquiry.status = senderRole === 'ADMIN' ? 'REPLIED' : 'OPEN';
    await this.writeStore(store);
    return this.normalizeInquiry(inquiry, account);
  }

  async closeInquiry(token: string | undefined, id: string) {
    const { store, account } = await this.getStoreAndAccount(token);
    if (!this.isPrivileged(account)) throw new UnauthorizedException('仅管理员或开发者可关闭会话');
    const inquiry = store.inquiries.find((item) => item.id === id);
    if (!inquiry) throw new NotFoundException('未找到该咨询记录');
    inquiry.status = 'CLOSED';
    await this.writeStore(store);
    return this.normalizeInquiry(inquiry, account);
  }

  async deleteInquiry(token: string | undefined, id: string) {
    const { store, account } = await this.getStoreAndAccount(token);
    const inquiry = store.inquiries.find((item) => item.id === id);
    if (!inquiry) throw new NotFoundException('未找到该咨询记录');
    if (!this.canDeleteInquiry(account, inquiry)) throw new UnauthorizedException('仅本人或管理员可删除该咨询');
    store.inquiries = store.inquiries.filter((item) => item.id !== id);
    await this.writeStore(store);
    return true;
  }

  async deleteInquiryMessage(token: string | undefined, inquiryId: string, messageId: string) {
    const { store, account } = await this.getStoreAndAccount(token);
    const inquiry = store.inquiries.find((item) => item.id === inquiryId);
    if (!inquiry) throw new NotFoundException('未找到该咨询记录');
    if (!this.canDeleteMessage(account, inquiry, messageId)) throw new UnauthorizedException('当前消息不支持删除');
    inquiry.messages = inquiry.messages.filter((item) => item.id !== messageId);
    inquiry.status = this.deriveInquiryStatus(inquiry) as InquiryRecord['status'];
    await this.writeStore(store);
    return this.normalizeInquiry(inquiry, account);
  }
}
