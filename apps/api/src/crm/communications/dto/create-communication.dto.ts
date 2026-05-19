import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { CommunicationChannel, CommunicationDirection } from '@prisma/client';

export class CreateCommunicationDto {
  @ApiProperty({ enum: CommunicationChannel })
  @IsEnum(CommunicationChannel)
  channel!: CommunicationChannel;

  @ApiProperty({ enum: CommunicationDirection })
  @IsEnum(CommunicationDirection)
  direction!: CommunicationDirection;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  subject?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  body?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  referenceType?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  referenceId?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional() @IsBoolean()
  isRead?: boolean;
}
