import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsDateString } from 'class-validator';

export class CreateExchangeRateDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fromCurrencyCode!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  toCurrencyCode!: string;

  @ApiProperty()
  @IsNumber()
  rate!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  effectiveFrom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  effectiveTo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  countryId?: string;
}
