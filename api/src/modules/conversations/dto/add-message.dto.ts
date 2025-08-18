import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class AddMessageDto {
  @ApiProperty({
    description: 'Conversation ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  conversationId: string;

  @ApiProperty({
    description: 'Message role (user or assistant)',
    example: 'user',
  })
  @IsString()
  role: string;

  @ApiProperty({
    description: 'Message content',
    example: 'How do I analyze this dataset?',
  })
  @IsString()
  content: string;

  @ApiProperty({
    description: 'Number of input tokens',
    example: 15,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  inputTokens?: number;

  @ApiProperty({
    description: 'Number of output tokens',
    example: 120,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  outputTokens?: number;

  @ApiProperty({
    description: 'Additional metadata',
    required: false,
    example: { files: ['data.xlsx'] },
  })
  @IsOptional()
  metadata?: Record<string, any>;
}
