import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({ example: 'users', description: 'Module name (e.g. users, products, orders)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  module!: string;

  @ApiProperty({ example: 'read', description: 'Action (e.g. read, write, delete, export)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  action!: string;

  @ApiPropertyOptional({ description: 'Human-readable description' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
