import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateConversationDto {
  @ApiProperty({
    description: 'Optional title for the conversation',
    example: 'Sales Data Analysis',
    required: false,
  })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  title?: string;
}
