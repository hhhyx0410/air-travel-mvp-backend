import { IsInt, Min } from 'class-validator';

export class JoinOrganizationDto {
  @IsInt()
  @Min(1)
  organizationId!: number;
}