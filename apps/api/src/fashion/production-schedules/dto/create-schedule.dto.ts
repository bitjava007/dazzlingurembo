import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

export class CreateScheduleDto {
  @ApiProperty() @IsString() @IsNotEmpty() workOrderId!: string;
  @ApiProperty() @IsString() @IsNotEmpty() workshopId!: string;
  @ApiProperty() @IsDateString() scheduledDate!: string;
  @ApiProperty() @IsString() @IsNotEmpty() title!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() teamId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() startTime?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() endTime?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}
