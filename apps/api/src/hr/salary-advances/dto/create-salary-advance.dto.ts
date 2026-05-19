import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty, IsNumber, IsDateString } from 'class-validator';

export class CreateSalaryAdvanceDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  employeeId!: string;

  @ApiProperty()
  @IsNumber()
  amount!: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  currencyCode!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  reason!: string;

  @ApiProperty()
  @IsDateString()
  requestedDate!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  repaymentDate?: string;
}
