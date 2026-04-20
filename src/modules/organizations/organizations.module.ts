import { Module } from '@nestjs/common';
import { OrganizationsController } from './organizations.controller';
import { PlatformModule } from '../platform/platform.module';

@Module({
  imports: [PlatformModule],
  controllers: [OrganizationsController],
})
export class OrganizationsModule {}