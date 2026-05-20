import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsDateString } from 'class-validator';

export class CreateCustomOrderDto {
  @ApiProperty() @IsString() @IsNotEmpty() customerId!: string;
  @ApiProperty() @IsString() @IsNotEmpty() branchId!: string;
  @ApiProperty() @IsString() @IsNotEmpty() title!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() bust?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() waist?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() hips?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() length?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() shoulders?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() sleeves?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() inseam?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() neck?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() measurementNotes?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() stylePreferences?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() colorPreferences?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() fabricPreferences?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() embellishments?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() specialInstructions?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() estimatedPrice?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() finalPrice?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() depositAmount?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() currencyCode?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() requiredByDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() fittingDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() deliveryDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}
