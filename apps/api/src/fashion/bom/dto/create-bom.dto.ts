import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsArray, ValidateNested, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBOMItemDto {
  @ApiProperty() @IsString() @IsNotEmpty() materialVariantId!: string;
  @ApiProperty() @IsNumber() @Min(0) quantity!: number;
  @ApiPropertyOptional() @IsOptional() @IsString() unit?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() wastagePercent?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() materialType?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

export class CreateBOMDto {
  @ApiProperty() @IsString() @IsNotEmpty() productId!: string;
  @ApiProperty() @IsString() @IsNotEmpty() name!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() version?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
  @ApiPropertyOptional({ type: [CreateBOMItemDto] })
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => CreateBOMItemDto)
  items?: CreateBOMItemDto[];
}
