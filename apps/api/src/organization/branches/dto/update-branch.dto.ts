import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsEnum, MaxLength, IsEmail, IsDateString } from 'class-validator';
import { BranchType } from '@prisma/client';

export class UpdateBranchDto {
  @ApiPropertyOptional({ description: 'Branch name' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ enum: BranchType, description: 'Branch type' })
  @IsOptional()
  @IsEnum(BranchType)
  type?: BranchType;

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

  @ApiPropertyOptional({ description: 'Whether the branch is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Whether this is the head office' })
  @IsOptional()
  @IsBoolean()
  isHeadOffice?: boolean;

  @ApiPropertyOptional({ description: 'Closing date (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  closingDate?: string;

  @ApiPropertyOptional({ description: 'Manager user ID' })
  @IsOptional()
  @IsString()
  managerId?: string;
}
