import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt, Min, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Robes & Tenues' })
  @IsString() @IsNotEmpty() @MaxLength(150)
  name!: string;

  @ApiProperty({ example: 'robes-tenues' })
  @IsString() @IsNotEmpty() @MaxLength(200)
  slug!: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Parent category ID for hierarchy' })
  @IsOptional() @IsString()
  parentId?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional() @IsInt() @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional() @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(200)
  metaTitle?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  metaDescription?: string;
}
