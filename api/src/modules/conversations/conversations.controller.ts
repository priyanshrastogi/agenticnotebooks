import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { RequestWithUser } from '@/common/types/request.types';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';

import { ConversationsService } from './conversations.service';
import { ConversationDto, CreateConversationDto, UpdateConversationDto } from './dto';

@ApiTags('Conversations')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all conversations for the authenticated user',
    description: 'Returns a list of conversation summaries without message content',
  })
  @ApiResponse({
    status: 200,
    description: 'List of conversation summaries (messages excluded)',
    type: [ConversationDto],
  })
  async findAll(@Req() req: RequestWithUser): Promise<ConversationDto[]> {
    return this.conversationsService.findAllByUserId(req.user.id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a conversation by ID',
    description: 'Returns a single conversation WITH all its messages',
  })
  @ApiResponse({
    status: 200,
    description: 'The conversation details including all messages',
    type: ConversationDto,
  })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  async findOne(@Param('id') id: string, @Req() req: RequestWithUser): Promise<ConversationDto> {
    return this.conversationsService.findById(id, req.user.id);
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new conversation',
    description: 'Creates an empty conversation with an optional title',
  })
  @ApiResponse({
    status: 201,
    description: 'The conversation has been created',
    type: ConversationDto,
  })
  async create(
    @Req() req: RequestWithUser,
    @Body() createConversationDto: CreateConversationDto
  ): Promise<ConversationDto> {
    return this.conversationsService.create(req.user.id, createConversationDto.title);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a conversation',
    description: 'Update conversation properties such as title',
  })
  @ApiResponse({
    status: 200,
    description: 'The conversation has been updated',
    type: ConversationDto,
  })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  async update(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
    @Body() updateConversationDto: UpdateConversationDto
  ): Promise<ConversationDto> {
    return this.conversationsService.update(id, req.user.id, updateConversationDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a conversation',
    description: 'Permanently deletes a conversation and all its messages',
  })
  @ApiResponse({
    status: 200,
    description: 'The conversation has been deleted',
  })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  async remove(
    @Param('id') id: string,
    @Req() req: RequestWithUser
  ): Promise<{ success: boolean }> {
    await this.conversationsService.delete(id, req.user.id);
    return { success: true };
  }
}
