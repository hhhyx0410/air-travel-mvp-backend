import { Body, Controller, Delete, Get, Headers, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { PlatformService } from '../platform/platform.service';
import { JoinOrganizationDto } from './dto/join-organization.dto';
import { CreateOrganizationDto } from './dto/create-organization.dto';

@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly platformService: PlatformService) {}

  @Get()
  async findAll(@Headers('x-auth-token') token?: string) {
    return { code: 0, message: 'ok', data: await this.platformService.fetchOrganizations(token) };
  }

  @Get('members')
  async findMembers(@Headers('x-auth-token') token?: string, @Query('organizationId') organizationId?: string) {
    return {
      code: 0,
      message: 'ok',
      data: await this.platformService.fetchOrganizationMembers(token, organizationId ? Number(organizationId) : undefined),
    };
  }

  @Get(':id/reviewers')
  async findEligibleReviewers(@Headers('x-auth-token') token: string | undefined, @Param('id', ParseIntPipe) id: number) {
    return { code: 0, message: 'ok', data: await this.platformService.fetchEligibleReviewers(token, id) };
  }

  @Post('join')
  async join(@Headers('x-auth-token') token: string | undefined, @Body() payload: JoinOrganizationDto) {
    return { code: 0, message: 'ok', data: await this.platformService.joinOrganization(token, payload.organizationId) };
  }

  @Post('leave')
  async leave(@Headers('x-auth-token') token?: string) {
    return { code: 0, message: 'ok', data: await this.platformService.leaveCurrentOrganization(token) };
  }

  @Post()
  async create(@Headers('x-auth-token') token: string | undefined, @Body() payload: CreateOrganizationDto) {
    return { code: 0, message: 'ok', data: await this.platformService.createOrganization(token, payload.name) };
  }

  @Delete(':id')
  async remove(@Headers('x-auth-token') token: string | undefined, @Param('id', ParseIntPipe) id: number) {
    return { code: 0, message: 'ok', data: await this.platformService.deleteOrganization(token, id) };
  }
}