import { IsOptional, IsString } from 'class-validator';

export class QueryStatisticsDto {
  @IsOptional()
  @IsString()
  month?: string;
}
