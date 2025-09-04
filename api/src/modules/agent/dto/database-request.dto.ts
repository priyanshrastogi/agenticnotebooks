import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';

export class TableMetadataDto {
  @ApiProperty({
    description: 'The DDL (Data Definition Language) of the table',
    example: 'CREATE TABLE public.users (...);',
  })
  @IsString()
  ddl: string;

  @ApiProperty({
    description: 'Optional description explaining what this table contains',
    example: 'User account information including personal details and preferences',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Optional descriptions for table columns',
    example: 'user_id: Primary key for user identification, email: User email address for login',
    required: false,
  })
  @IsString()
  @IsOptional()
  columnsDescription?: string;
}

export class SchemaMetadataDto {
  @ApiProperty({
    description: 'Map of table names to their metadata in this schema',
    type: 'object',
    additionalProperties: {
      type: 'object',
      $ref: '#/components/schemas/TableMetadataDto',
    },
  })
  @IsObject()
  @ValidateNested()
  @Type(() => Object)
  tables: Record<string, TableMetadataDto>;
}

export class DatabaseMetadataDto {
  @ApiProperty({
    description: 'Database type',
    enum: ['postgres', 'mysql', 'sqlite'],
    example: 'postgres',
  })
  @IsString()
  @IsEnum(['postgres', 'mysql', 'sqlite'])
  type: 'postgres' | 'mysql' | 'sqlite';

  @ApiProperty({
    description: 'Map of schema names to their tables',
    type: 'object',
    additionalProperties: {
      type: 'object',
      $ref: '#/components/schemas/SchemaMetadataDto',
    },
  })
  @IsObject()
  @ValidateNested()
  @Type(() => Object)
  schemas: Record<string, SchemaMetadataDto>;
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
    example: 'Show me all users who signed up last month',
  })
  @IsString()
  content: string;
}

export class DatabaseRequestDto {
  @ApiProperty({
    description: 'The user query to send to the agent',
    example: 'Show me all users who signed up last month',
  })
  @IsString()
  query: string;

  @ApiProperty({
    description: 'The metadata of the database schemas and tables',
    type: DatabaseMetadataDto,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => DatabaseMetadataDto)
  metadata: DatabaseMetadataDto;

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
