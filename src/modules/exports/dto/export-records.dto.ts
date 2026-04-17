import { IsOptional, IsString } from 'class-validator';

export class ExportRecordsDto {
  @IsOptional()
  @IsString()
  month?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
