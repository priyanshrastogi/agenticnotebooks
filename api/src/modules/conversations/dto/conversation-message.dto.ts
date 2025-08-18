import { ApiProperty } from '@nestjs/swagger';

export class ConversationMessageDto {
  @ApiProperty({
    description: 'Unique identifier for the message',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'The ID of the conversation this message belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  conversationId: string;

  @ApiProperty({
    description: 'The role of the message sender (user or assistant)',
    example: 'user',
    enum: ['user', 'assistant', 'system'],
  })
  role: string;

  @ApiProperty({
    description: 'The content of the message',
    example: 'How can I analyze my Excel data?',
  })
  content: string;

  @ApiProperty({
    description: 'Number of input tokens used for this message',
    example: 25,
  })
  inputTokens: number;

  @ApiProperty({
    description: 'Number of output tokens used for this message',
    example: 150,
  })
  outputTokens: number;

  @ApiProperty({
    description: 'The timestamp when the message was created',
    example: '2023-10-15T14:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Additional metadata for the message',
    example: {
      files: ['sales_data.xlsx'],
      code: 'function analyzeData() {...}',
    },
    required: false,
  })
  metadata?: Record<string, any>;
}
