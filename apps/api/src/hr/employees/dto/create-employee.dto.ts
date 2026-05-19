import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty, IsDateString, IsNumber } from 'class-validator';

export class CreateEmployeeDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  employeeCode!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  email!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  departmentId!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  branchId!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  jobTitle!: string;

  @ApiProperty()
  @IsDateString()
  hireDate!: string;

  @ApiProperty()
  @IsNumber()
  salary!: number;

  @ApiProperty({ enum: ['XOF', 'USD'] })
  @IsString()
  currencyCode!: string;

  @ApiProperty({ enum: ['FULL_TIME', 'PART_TIME', 'CONTRACT'] })
  @IsString()
  employmentType!: string;

  @ApiPropertyOptional({ enum: ['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED'] })
  @IsOptional()
  @IsString()
  status?: string;
}
