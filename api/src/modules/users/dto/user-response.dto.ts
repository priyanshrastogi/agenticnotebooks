import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the user',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Name of the user',
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    description: 'Flag indicating if the email has been verified',
    example: true,
  })
  emailVerified: boolean;

  @ApiProperty({
    description: 'Flag indicating if the user account is active',
    example: true,
  })
  active: boolean;

  @ApiProperty({
    description: 'Date when the user account was created',
    example: '2023-01-01T00:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date of the last user login',
    example: '2023-01-02T00:00:00Z',
    nullable: true,
  })
  lastLogin: Date;
}
