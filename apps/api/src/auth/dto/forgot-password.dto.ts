import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'user@dazzlingurembo.com', description: 'Registered email address' })
  @IsEmail()
  email!: string;
}
