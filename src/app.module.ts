import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { ApplicationsModule } from './modules/applications/applications.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { StatisticsModule } from './modules/statistics/statistics.module';
import { ExportsModule } from './modules/exports/exports.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    DepartmentsModule,
    ApplicationsModule,
    BookingsModule,
    StatisticsModule,
    ExportsModule,
  ],
})
export class AppModule {}
