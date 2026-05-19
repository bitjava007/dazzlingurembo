import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty, IsBoolean, IsArray } from 'class-validator';

export class CreateTemplateDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({ enum: ['EMAIL', 'SMS', 'PUSH', 'IN_APP'] })
  @IsString()
  @IsNotEmpty()
  channel!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  bodyTemplate!: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  variables?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
