import { Module } from '@nestjs/common';
import { InquiriesController } from './inquiries.controller';
import { PlatformModule } from '../platform/platform.module';

@Module({
  imports: [PlatformModule],
  controllers: [InquiriesController],
})
export class InquiriesModule {}