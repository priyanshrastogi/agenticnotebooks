import { ApiProperty } from '@nestjs/swagger';

export class DatabaseResponseDto {
  @ApiProperty({
    description: "The agent's response to the user message",
    example:
      'I have generated a SQL query to find all users who signed up last month.',
  })
  response: string;

  @ApiProperty({
    description: 'The conversation ID to use for continuing this conversation',
    example: 'abc123xyz789',
  })
  conversationId: string;

  @ApiProperty({
    description:
      'The generated SQL query that can be executed to get the requested data',
    example:
      "SELECT * FROM users WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') AND created_at < DATE_TRUNC('month', CURRENT_DATE);",
  })
  sql: string;
}
