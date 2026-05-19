import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ example: 'STORE_MANAGER', description: 'Unique role name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({ example: 'Manages a single store branch', description: 'Role description' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ description: 'Whether this is a system-defined role', default: false })
  @IsOptional()
  @IsBoolean()
  isSystem?: boolean;
}
