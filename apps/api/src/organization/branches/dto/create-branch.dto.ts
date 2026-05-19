import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsEnum, MaxLength, IsEmail, IsDateString } from 'class-validator';
import { BranchType } from '@prisma/client';

export class CreateBranchDto {
  @ApiProperty({ example: 'Casablanca Flagship', description: 'Branch name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @ApiProperty({ example: 'CASA-001', description: 'Unique branch code' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  code!: string;

  @ApiProperty({ enum: BranchType, description: 'Branch type' })
  @IsEnum(BranchType)
  type!: BranchType;

  @ApiProperty({ description: 'Country ID' })
  @IsString()
  @IsNotEmpty()
  countryId!: string;

  @ApiPropertyOptional({ description: 'Street address' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @ApiPropertyOptional({ description: 'City' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ description: 'State or region' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  stateRegion?: string;

  @ApiPropertyOptional({ description: 'Postal code' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  postalCode?: string;

  @ApiPropertyOptional({ description: 'Branch phone number' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiPropertyOptional({ description: 'Branch email' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Whether the branch is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Whether this is the head office', default: false })
  @IsOptional()
  @IsBoolean()
  isHeadOffice?: boolean;

  @ApiPropertyOptional({ description: 'Opening date (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  openingDate?: string;

  @ApiPropertyOptional({ description: 'Manager user ID' })
  @IsOptional()
  @IsString()
  managerId?: string;
}
