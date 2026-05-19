import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

export class AssignRoleDto {
  @ApiProperty({ description: 'Role ID to assign' })
  @IsString()
  @IsNotEmpty()
  roleId!: string;

  @ApiPropertyOptional({ description: 'Branch ID for branch-scoped role (null = org-wide)' })
  @IsOptional()
  @IsString()
  branchId?: string;

  @ApiPropertyOptional({ description: 'Expiry date for the role assignment (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
