import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsEnum,
  Matches,
} from 'class-validator';
import { Role } from '@prisma/client';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'newemail@example.com',
    description: 'Updated email address',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;

  @ApiPropertyOptional({
    example: 'Jane Doe',
    description: 'Updated display name',
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    description: 'New password',
    minLength: 8,
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  password?: string;

  @ApiPropertyOptional({
    enum: Role,
    description: 'Updated user role',
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
