import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean, IsNumber, IsInt, Min, IsArray, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductStatus } from '@prisma/client';

export class CreateProductDto {
  @ApiProperty({ example: 'Boubou Grand Boubou' })
  @IsString() @IsNotEmpty() @MaxLength(200)
  name!: string;

  @ApiProperty({ example: 'boubou-grand-boubou' })
  @IsString() @IsNotEmpty() @MaxLength(250)
  slug!: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(500)
  shortDescription?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ example: 'Dazzling UM' })
  @IsOptional() @IsString() @MaxLength(100)
  brand?: string;

  @ApiPropertyOptional({ example: 'Senegal' })
  @IsOptional() @IsString() @MaxLength(100)
  origin?: string;

  @ApiPropertyOptional({ type: [String], example: ['cotton', 'handmade'] })
  @IsOptional() @IsArray() @IsString({ each: true })
  materials?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional() @IsArray() @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ enum: ProductStatus, default: ProductStatus.DRAFT })
  @IsOptional() @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiProperty({ example: 'XOF', description: 'Base currency code (XOF or USD)' })
  @IsString() @IsNotEmpty() @MaxLength(10)
  baseCurrencyCode!: string;

  @ApiProperty({ example: 45000, description: 'Base price in baseCurrencyCode' })
  @Type(() => Number) @IsNumber() @Min(0)
  basePrice!: number;

  @ApiPropertyOptional({ example: 30000 })
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0)
  costPrice?: number;

  @ApiPropertyOptional()
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0)
  weight?: number;

  @ApiPropertyOptional({ default: 'kg' })
  @IsOptional() @IsString() @MaxLength(10)
  weightUnit?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional() @IsBoolean()
  isSerialized?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional() @IsBoolean()
  trackInventory?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional() @IsInt() @Min(0)
  minStockLevel?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional() @IsInt() @Min(0)
  reorderPoint?: number;
}
