import { IsNotEmpty, IsString } from 'class-validator';

export class ReplyInquiryDto {
  @IsString()
  @IsNotEmpty()
  content!: string;
}