import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsDateString, IsEnum } from 'class-validator';
import { JournalEntryType } from '@prisma/client';

export class CreateJournalDto {
  @ApiProperty()
  @IsString()
  description!: string;

  @ApiProperty({ enum: JournalEntryType })
  @IsEnum(JournalEntryType)
  entryType!: JournalEntryType;

  @ApiProperty()
  @IsString()
  branchId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  accountCode?: string;

  @ApiProperty()
  @IsString()
  originalCurrencyCode!: string;

  @ApiProperty()
  @IsNumber()
  originalAmount!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  convertedCurrencyCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  convertedAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  exchangeRateSnapshot?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  referenceType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  referenceId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  postDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
