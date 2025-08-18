import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateConversationDto {
  @ApiProperty({
    description: 'The updated title for the conversation',
    example: 'Revenue Analysis Q4 2023',
    required: false,
  })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  title?: string;
}
