import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class CreateSkuDto {
  @ApiProperty({ example: 'BOUBOU-001-L-BLU-001' })
  @IsString() @IsNotEmpty() @MaxLength(100)
  sku!: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(100)
  barcode?: string;

  @ApiPropertyOptional({ description: 'Serial number for serialized items' })
  @IsOptional() @IsString() @MaxLength(100)
  serialNumber?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(100)
  batchNumber?: string;

  @ApiPropertyOptional({ default: 'NEW', enum: ['NEW', 'REFURBISHED', 'DAMAGED'] })
  @IsOptional() @IsString()
  condition?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional() @IsBoolean()
  isActive?: boolean;
}
