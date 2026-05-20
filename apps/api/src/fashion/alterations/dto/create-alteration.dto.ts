import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateAlterationDto {
  @ApiProperty() @IsString() @IsNotEmpty() customerId!: string;
  @ApiProperty() @IsString() @IsNotEmpty() branchId!: string;
  @ApiProperty() @IsString() @IsNotEmpty() description!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() alterationType?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() workshopId?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() estimatedCost?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() currencyCode?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() tailorId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() estimatedTime?: number;
}
