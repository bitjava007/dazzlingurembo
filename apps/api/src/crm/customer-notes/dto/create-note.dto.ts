import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsArray } from 'class-validator';

export class CreateCustomerNoteDto {
  @ApiProperty()
  @IsString() @IsNotEmpty()
  content!: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional() @IsBoolean()
  isPrivate?: boolean;

  @ApiPropertyOptional({ type: [String], example: ['follow-up', 'vip'] })
  @IsOptional() @IsArray() @IsString({ each: true })
  tags?: string[];
}
