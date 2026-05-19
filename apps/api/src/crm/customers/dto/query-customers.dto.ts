import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsBoolean, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { CustomerTier } from '@prisma/client';

export class QueryCustomersDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Full-text search on name, email, phone, code' })
  @IsOptional() @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: CustomerTier })
  @IsOptional() @IsEnum(CustomerTier)
  tier?: CustomerTier;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  countryId?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  primaryBranchId?: string;

  @ApiPropertyOptional()
  @IsOptional() @Type(() => Boolean) @IsBoolean()
  isVip?: boolean;

  @ApiPropertyOptional()
  @IsOptional() @Type(() => Boolean) @IsBoolean()
  isBlacklisted?: boolean;
}
