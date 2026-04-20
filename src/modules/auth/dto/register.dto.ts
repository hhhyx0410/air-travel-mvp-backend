import { IsEnum, IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export enum RegisterRole {
  EMPLOYEE = 'EMPLOYEE',
  ADMIN = 'ADMIN',
}

export class RegisterDto {
  @IsString()
  username!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  @MinLength(6)
  confirmPassword!: string;

  @IsEnum(RegisterRole)
  role!: RegisterRole;

  @IsOptional()
  @IsInt()
  organizationId?: number;

  @IsOptional()
  @IsString()
  organizationMode?: 'EXISTING' | 'NEW';

  @IsOptional()
  @IsString()
  newOrganization?: string;
}