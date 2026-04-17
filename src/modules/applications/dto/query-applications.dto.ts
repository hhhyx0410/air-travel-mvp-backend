import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PageQueryDto } from '../../../common/dto/page-query.dto';
import { ApplicationStatus } from '../../../common/enums/application-status.enum';

export class QueryApplicationsDto extends PageQueryDto {
  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @IsOptional()
  @IsString()
  month?: string;

  @IsOptional()
  @IsString()
  keyword?: string;
}
