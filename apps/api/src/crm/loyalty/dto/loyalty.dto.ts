import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, Min, IsString, IsNotEmpty, IsOptional, IsPositive } from 'class-validator';

export class AddPointsDto {
  @ApiProperty({ example: 100 })
  @IsInt() @IsPositive()
  points!: number;

  @ApiProperty({ example: 'PURCHASE', description: 'Transaction type' })
  @IsString() @IsNotEmpty()
  type!: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  referenceType?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  referenceId?: string;
}

export class RedeemPointsDto {
  @ApiProperty({ example: 50 })
  @IsInt() @Min(1)
  points!: number;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  referenceId?: string;
}
