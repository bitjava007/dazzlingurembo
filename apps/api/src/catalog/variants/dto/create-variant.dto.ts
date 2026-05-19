import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsNumber, IsInt, Min, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateVariantDto {
  @ApiProperty({ example: 'Large / Bleu' })
  @IsString() @IsNotEmpty() @MaxLength(150)
  name!: string;

  @ApiProperty({ example: 'BOUBOU-001-L-BLU' })
  @IsString() @IsNotEmpty() @MaxLength(100)
  sku!: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(100)
  barcode?: string;

  @ApiPropertyOptional({ example: 'Bleu' })
  @IsOptional() @IsString() @MaxLength(50)
  color?: string;

  @ApiPropertyOptional({ example: 'L' })
  @IsOptional() @IsString() @MaxLength(20)
  size?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(100)
  material?: string;

  @ApiPropertyOptional({ default: 0, description: 'Price adjustment from base price' })
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0)
  priceAdjustment?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0)
  costAdjustment?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional() @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional() @IsInt() @Min(0)
  position?: number;
}
