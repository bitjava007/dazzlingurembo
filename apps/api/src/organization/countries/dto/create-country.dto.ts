import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, MaxLength, Length } from 'class-validator';

export class CreateCountryDto {
  @ApiProperty({ example: 'Morocco', description: 'Country name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiProperty({ example: 'MA', description: 'ISO 3166-1 alpha-2 code' })
  @IsString()
  @Length(2, 2)
  isoCode2!: string;

  @ApiProperty({ example: 'MAR', description: 'ISO 3166-1 alpha-3 code' })
  @IsString()
  @Length(3, 3)
  isoCode3!: string;

  @ApiProperty({ example: 'MAD', description: 'Currency code' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  currencyCode!: string;

  @ApiProperty({ example: 'Moroccan Dirham', description: 'Currency name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  currencyName!: string;

  @ApiProperty({ example: 'د.م.', description: 'Currency symbol' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  currencySymbol!: string;

  @ApiPropertyOptional({ example: '+212', description: 'Country dial code' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  dialCode?: string;

  @ApiPropertyOptional({ example: 'ar-MA', description: 'Locale', default: 'en' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  locale?: string;

  @ApiPropertyOptional({ example: 'Africa/Casablanca', description: 'Timezone', default: 'UTC' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  timezone?: string;

  @ApiPropertyOptional({ description: 'Whether this country is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
