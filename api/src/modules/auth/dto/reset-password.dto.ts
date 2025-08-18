import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsUUID,
  Matches,
  MinLength,
} from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Verification token ID',
    example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
  })
  @IsString({ message: 'Token ID must be a string' })
  @IsUUID('4', { message: 'Token ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Token ID is required' })
  id: string;

  @ApiProperty({
    description: 'Password reset code received via email',
    example: 'ABC123',
  })
  @IsString({ message: 'Code must be a string' })
  @IsNotEmpty({ message: 'Code is required' })
  @Matches(/^[A-Z0-9]{6}$/, {
    message: 'Code must be 6 characters of uppercase letters and numbers',
  })
  code: string;

  @ApiProperty({
    description: 'New password for the account',
    example: 'newSecurePassword123',
    minLength: 8,
  })
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}
