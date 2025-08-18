import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class TokensDto {
  @ApiProperty({
    description: 'Authorization token received from /authorize endpoint',
    example: 'auth_token_123',
  })
  @IsString({ message: 'Authorization token must be a string' })
  @IsNotEmpty({ message: 'Authorization token is required' })
  authorizationToken: string;

  @ApiProperty({
    description: 'Client ID that was used to create the authorization token',
    example: 'desktop_app_v1',
  })
  @IsString({ message: 'Client ID must be a string' })
  @IsNotEmpty({ message: 'Client ID is required' })
  clientId: string;
}
