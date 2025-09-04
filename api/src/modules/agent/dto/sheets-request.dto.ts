import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

// Convert interface to DTO class with validation
export class FileMetadataDto {
  @ApiProperty({
    description: 'The name of the file',
    example: 'sales_data.xlsx',
  })
  @IsString()
  fileName: string;

  @ApiProperty({
    description: 'The type of spreadsheet file',
    example: 'xlsx',
    enum: ['xlsx', 'xls', 'csv'],
  })
  @IsEnum(['xlsx', 'xls', 'csv'])
  fileType: 'xlsx' | 'xls' | 'csv';

  @ApiProperty({
    description: 'The size of the file in bytes',
    example: 1024000,
  })
  @IsNumber()
  fileSize: number;

  @ApiProperty({
    description: 'The number of sheets in the spreadsheet',
    example: 3,
  })
  @IsNumber()
  sheetsNumber: number;

  @ApiProperty({
    description: 'The data of each sheet in the spreadsheet',
    type: 'object',
    additionalProperties: true,
  })
  @IsObject()
  sheets: Record<string, any>;
}

export class MessageDto {
  @ApiProperty({
    description: 'The role of the message sender (user or assistant)',
    example: 'user',
    enum: ['user', 'assistant'],
  })
  @IsString()
  role: string;

  @ApiProperty({
    description: 'The content of the message',
    example: 'How can I analyze my Excel data?',
  })
  @IsString()
  content: string;
}

export class SheetsRequestDto {
  @ApiProperty({
    description: 'The user query to send to the agent',
    example: 'How can I analyze my Excel data?',
  })
  @IsString()
  query: string;

  @ApiProperty({
    description: 'The metadata of the uploaded spreadsheet file',
    type: [FileMetadataDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FileMetadataDto)
  files: FileMetadataDto[];

  @ApiProperty({
    description: 'Optional conversation history',
    type: [MessageDto],
    required: false,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessageDto)
  @IsOptional()
  history?: MessageDto[];

  @ApiProperty({
    description: 'Optional conversation ID to continue an existing conversation',
    example: 'abc123xyz789',
    required: false,
  })
  @IsString()
  @IsOptional()
  conversationId?: string;
}
