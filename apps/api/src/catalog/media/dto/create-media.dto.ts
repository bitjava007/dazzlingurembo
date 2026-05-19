import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsEnum, IsInt, Min } from 'class-validator';
import { MediaType } from '@prisma/client';

export class CreateMediaDto {
  @ApiProperty({ enum: MediaType, default: MediaType.IMAGE })
  @IsEnum(MediaType)
  type!: MediaType;

  @ApiProperty({ example: 'https://storage.example.com/product.jpg' })
  @IsString() @IsNotEmpty()
  url!: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  thumbnailUrl?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  altText?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  mimeType?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsInt()
  sizeBytes?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional() @IsInt() @Min(0)
  position?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional() @IsBoolean()
  isPrimary?: boolean;
}
