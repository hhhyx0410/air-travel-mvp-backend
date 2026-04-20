import { Body, Controller, Delete, Get, Headers, Param, Post } from '@nestjs/common';
import { PlatformService } from '../platform/platform.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { ReplyInquiryDto } from './dto/reply-inquiry.dto';

@Controller('inquiries')
export class InquiriesController {
  constructor(private readonly platformService: PlatformService) {}

  @Get('my')
  async findMine(@Headers('x-auth-token') token?: string) {
    return { code: 0, message: 'ok', data: await this.platformService.fetchMyInquiries(token) };
  }

  @Get()
  async findAll(@Headers('x-auth-token') token?: string) {
    return { code: 0, message: 'ok', data: await this.platformService.fetchAllInquiries(token) };
  }

  @Post()
  async create(@Headers('x-auth-token') token: string | undefined, @Body() payload: CreateInquiryDto) {
    return { code: 0, message: 'ok', data: await this.platformService.createInquiry(token, payload) };
  }

  @Get(':id')
  async findOne(@Headers('x-auth-token') token: string | undefined, @Param('id') id: string) {
    return { code: 0, message: 'ok', data: await this.platformService.fetchInquiryDetail(token, id) };
  }

  @Post(':id/reply')
  async reply(@Headers('x-auth-token') token: string | undefined, @Param('id') id: string, @Body() payload: ReplyInquiryDto) {
    return { code: 0, message: 'ok', data: await this.platformService.replyInquiry(token, id, payload.content) };
  }

  @Post(':id/close')
  async close(@Headers('x-auth-token') token: string | undefined, @Param('id') id: string) {
    return { code: 0, message: 'ok', data: await this.platformService.closeInquiry(token, id) };
  }

  @Delete(':id')
  async remove(@Headers('x-auth-token') token: string | undefined, @Param('id') id: string) {
    return { code: 0, message: 'ok', data: await this.platformService.deleteInquiry(token, id) };
  }

  @Delete(':id/messages/:messageId')
  async removeMessage(@Headers('x-auth-token') token: string | undefined, @Param('id') id: string, @Param('messageId') messageId: string) {
    return { code: 0, message: 'ok', data: await this.platformService.deleteInquiryMessage(token, id, messageId) };
  }
}