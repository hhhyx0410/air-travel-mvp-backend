import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { ApplicationsModule } from './modules/applications/applications.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { StatisticsModule } from './modules/statistics/statistics.module';
import { ExportsModule } from './modules/exports/exports.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST', '127.0.0.1'),
        port: Number(configService.get<string>('DB_PORT', '3306')),
        username: configService.get<string>('DB_USERNAME', 'travel_app'),
        password: configService.get<string>('DB_PASSWORD', ''),
        database: configService.get<string>('DB_DATABASE', 'air_travel_mvp'),
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),
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
