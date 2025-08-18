import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GoogleAuthDto {
  @ApiProperty({
    description: 'Authorization code returned by Google OAuth',
    example: '4/P7q7W91a-oMsCeLvIaQm6bTrgtp7',
    required: true,
  })
  @IsString({ message: 'Code must be a string' })
  @IsNotEmpty({ message: 'Code is required' })
  code: string;

  @ApiProperty({
    description: 'Optional state parameter for CSRF protection',
    example: 'security_token=abc123',
    required: false,
  })
  @IsString({ message: 'State must be a string' })
  @IsOptional()
  state?: string;
}
