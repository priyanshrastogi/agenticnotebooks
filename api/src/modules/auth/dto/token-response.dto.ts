import { ApiProperty } from '@nestjs/swagger';

export class TokenResponseDto {
  @ApiProperty({
    description: 'JWT access token for authentication',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyNDI2MjJ9.aryYmzKCwb1-gx8fJ0vPzYWOJLAHk_JkLvqpxqLty9I',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Type of token issued',
    example: 'Bearer',
  })
  tokenType: string;

  @ApiProperty({
    description: 'JWT refresh token for obtaining new access tokens',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNTE2MjM5MDIyfQ.L8i6g3PfcHlioHCCPURC9pmXT7gdJpx3kOoyAfNUwCc',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'Time in seconds until the access token expires',
    example: 3600,
  })
  expiresIn: number;
}
