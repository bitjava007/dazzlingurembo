import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsInt, IsNumber } from 'class-validator';

export class CreateProductionStageDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  workOrderId!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsInt()
  sequence!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  plannedDuration?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  operatorId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CompleteStageDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  actualDuration?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class FailStageDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}
