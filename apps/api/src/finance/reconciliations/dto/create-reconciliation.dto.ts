import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateReconciliationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  dailyClosureId!: string;

  @ApiProperty()
  @IsString()
  branchId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  discrepancyAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  discrepancyNotes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
