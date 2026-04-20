import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateInquiryDto {
  @IsString()
  @MinLength(4)
  content!: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  subject?: string;
}