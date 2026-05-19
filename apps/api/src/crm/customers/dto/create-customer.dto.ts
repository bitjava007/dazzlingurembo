import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString, IsEmail, IsOptional, IsEnum, IsBoolean, IsDateString,
  MaxLength, IsNotEmpty,
} from 'class-validator';
import { Gender, CustomerTier } from '@prisma/client';

export class CreateCustomerDto {
  @ApiProperty({ example: 'Amina' })
  @IsString() @IsNotEmpty() @MaxLength(100)
  firstName!: string;

  @ApiProperty({ example: 'Diallo' })
  @IsString() @IsNotEmpty() @MaxLength(100)
  lastName!: string;

  @ApiPropertyOptional({ example: 'amina@example.com' })
  @IsOptional() @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+221701234567' })
  @IsOptional() @IsString() @MaxLength(30)
  phone?: string;

  @ApiPropertyOptional({ example: '+221701234568' })
  @IsOptional() @IsString() @MaxLength(30)
  phone2?: string;

  @ApiPropertyOptional({ enum: Gender })
  @IsOptional() @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({ example: '1990-05-15' })
  @IsOptional() @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(50)
  nationalId?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(50)
  passportNumber?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(100)
  nationality?: string;

  @ApiPropertyOptional({ default: 'en' })
  @IsOptional() @IsString() @MaxLength(10)
  preferredLanguage?: string;

  @ApiPropertyOptional({ enum: CustomerTier, default: CustomerTier.BRONZE })
  @IsOptional() @IsEnum(CustomerTier)
  tier?: CustomerTier;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(255)
  addressLine1?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(255)
  addressLine2?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(100)
  city?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(100)
  stateRegion?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(20)
  postalCode?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  countryId?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  primaryBranchId?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional() @IsBoolean()
  isVip?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional() @IsBoolean()
  marketingConsent?: boolean;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(100)
  source?: string;
}
