import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, MaxLength, Length } from 'class-validator';

export class UpdateCountryDto {
  @ApiPropertyOptional({ example: 'Morocco', description: 'Country name' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: '+212', description: 'Country dial code' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  dialCode?: string;

  @ApiPropertyOptional({ example: 'MAD', description: 'Currency code' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  currencyCode?: string;

  @ApiPropertyOptional({ example: 'Moroccan Dirham', description: 'Currency name' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  currencyName?: string;

  @ApiPropertyOptional({ example: 'د.م.', description: 'Currency symbol' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  currencySymbol?: string;

  @ApiPropertyOptional({ example: 'ar-MA', description: 'Locale' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  locale?: string;

  @ApiPropertyOptional({ example: 'Africa/Casablanca', description: 'Timezone' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  timezone?: string;

  @ApiPropertyOptional({ description: 'Whether this country is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
