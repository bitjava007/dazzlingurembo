import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty, IsNumber, IsDateString, IsBoolean, IsInt } from 'class-validator';

export class CreateSalaryAdvanceDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  employeeId!: string;

  @ApiProperty()
  @IsNumber()
  originalAmount!: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  originalCurrencyCode!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  convertedAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  convertedCurrencyCode?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  reason!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  repaymentDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  deductFromPayroll?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  installments?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
