import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ description: 'The refresh token issued during login' })
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}
