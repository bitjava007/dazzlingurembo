import { PartialType } from '@nestjs/swagger';
import { CreateCustomerDto } from './create-customer.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBoolean, IsString } from 'class-validator';

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {
  @ApiPropertyOptional({ description: 'Blacklist reason — set to blacklist the customer' })
  @IsOptional() @IsString()
  blacklistReason?: string;

  @ApiPropertyOptional({ description: 'Remove from blacklist' })
  @IsOptional() @IsBoolean()
  isBlacklisted?: boolean;
}
