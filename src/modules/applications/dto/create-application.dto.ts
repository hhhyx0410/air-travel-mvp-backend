import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export enum TripType {
  ONE_WAY = 'ONE_WAY',
  ROUND_TRIP = 'ROUND_TRIP',
}

export class CreateApplicationDto {
  @IsEnum(TripType)
  tripType!: TripType;

  @IsDateString()
  departureDate!: string;

  @IsOptional()
  @IsDateString()
  returnDate?: string;

  @IsString()
  @IsNotEmpty()
  fromCity!: string;

  @IsString()
  @IsNotEmpty()
  toCity!: string;

  @IsOptional()
  @IsString()
  returnFromCity?: string;

  @IsOptional()
  @IsString()
  returnToCity?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  reason!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  remarks?: string;

  @IsOptional()
  @IsNumber()
  estimatedBudget?: number;
}
