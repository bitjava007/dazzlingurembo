import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsDateString } from 'class-validator';

export class CreateCashClosureDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  branchId!: string;

  @ApiProperty()
  @IsDateString()
  closureDate!: string;

  @ApiProperty()
  @IsNumber()
  totalSales!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  totalRefunds?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  totalExpenses?: number;

  @ApiProperty()
  @IsNumber()
  netRevenue!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  cashInDrawer?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  expectedCash?: number;

  @ApiProperty()
  @IsString()
  currencyCode!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
