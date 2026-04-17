import { IsOptional, IsString } from 'class-validator';

export class QueryDepartmentsDto {
  @IsOptional()
  @IsString()
  keyword?: string;
}
