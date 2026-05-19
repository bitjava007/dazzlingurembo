import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsNumber, Min, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateWarehouseDto {
  @ApiPropertyOptional({ description: 'Warehouse name' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ description: 'Branch ID' })
  @IsOptional()
  @IsString()
  branchId?: string;

  @ApiPropertyOptional({ description: 'Warehouse address' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @ApiPropertyOptional({ description: 'Total capacity' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Type(() => Number)
  totalCapacity?: number;

  @ApiPropertyOptional({ description: 'Whether this warehouse is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Whether this is the default warehouse' })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
