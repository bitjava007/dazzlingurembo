import { IsString, IsOptional, IsArray, ValidateNested, IsInt, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class InventoryCountItemDto {
  @ApiProperty()
  @IsString()
  variantId!: string;

  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  expectedQuantity!: number;

  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  countedQuantity!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateInventoryCountDto {
  @ApiProperty()
  @IsString()
  warehouseId!: string;

  @ApiProperty()
  @IsString()
  branchId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ type: [InventoryCountItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InventoryCountItemDto)
  items?: InventoryCountItemDto[];
}
