import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty, IsNumber, IsDateString } from 'class-validator';

export class CreatePayrollDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  employeeId!: string;

  @ApiProperty({ description: 'Period in YYYY-MM format' })
  @IsString()
  @IsNotEmpty()
  period!: string;

  @ApiProperty()
  @IsNumber()
  baseSalary!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  allowances?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  deductions?: number;

  @ApiProperty()
  @IsNumber()
  netSalary!: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  currencyCode!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  paymentMethod!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  paymentDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
