import { ApiProperty } from '@nestjs/swagger';

import { ConversationMessageDto } from './conversation-message.dto';

export class ConversationDto {
  @ApiProperty({
    description: 'Unique identifier for the conversation',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'The ID of the user who owns this conversation',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId: string;

  @ApiProperty({
    description: 'The title of the conversation',
    example: 'Sales Data Analysis',
  })
  title: string;

  @ApiProperty({
    description: 'The timestamp when the conversation was created',
    example: '2023-10-15T14:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'The timestamp when the conversation was last updated',
    example: '2023-10-15T15:45:00Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'The timestamp of the last message in the conversation',
    example: '2023-10-15T15:45:00Z',
  })
  lastMessageAt: Date;

  @ApiProperty({
    description:
      'Messages associated with this conversation (only included in detail view)',
    type: [ConversationMessageDto],
    required: false,
  })
  messages?: ConversationMessageDto[];

  @ApiProperty({
    description: 'Additional metadata for the conversation',
    example: { topic: 'Revenue Analysis', tags: ['sales', 'finance'] },
    required: false,
  })
  metadata?: Record<string, any>;
}
