import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { RequestWithUser } from '@/common/types/request.types';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { ConversationsService } from '@/modules/conversations/conversations.service';
import { CreditsUsageService } from '@/modules/credits/credits-usage.service';
import { CreditsGuard } from '@/modules/credits/guards/credits.guard';
import { UsersService } from '@/modules/users/users.service';

import { AgentService } from './agent.service';
import { DatabaseRequestDto } from './dto/database-request.dto';
import { DatabaseResponseDto } from './dto/database-response.dto';
import { SheetsRequestDto } from './dto/sheets-request.dto';
import { SheetsResponseDto } from './dto/sheets-response.dto';

type AgentResponse = SheetsResponseDto | DatabaseResponseDto;
type AgentType = 'sheets' | 'database';

@ApiTags('Agent')
@ApiBearerAuth('JWT-auth')
@Controller('agent')
export class AgentController {
  constructor(
    private readonly agentService: AgentService,
    private readonly conversationsService: ConversationsService,
    private readonly creditsUsageService: CreditsUsageService,
    private readonly usersService: UsersService
  ) {}

  @ApiOperation({ summary: 'Chat with the AI agent' })
  @ApiParam({
    name: 'type',
    enum: ['sheets', 'database'],
    description: 'Type of AI agent to use',
  })
  @ApiResponse({
    status: 200,
    description: 'Chat response',
    type: SheetsResponseDto,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, CreditsGuard)
  @Post(':type/chat')
  @HttpCode(HttpStatus.OK)
  async chat(
    @Param('type') type: AgentType,
    @Body() chatRequestDto: SheetsRequestDto | DatabaseRequestDto,
    @Req() req: RequestWithUser
  ): Promise<AgentResponse> {
    let conversationId = chatRequestDto.conversationId || '';

    // Create a new conversation if conversationId is empty
    if (!conversationId) {
      const conversation = await this.conversationsService.create(req.user.id, 'New Chat');
      conversationId = conversation.id;
    }

    // Save user message to the conversation
    await this.conversationsService.addMessage({
      conversationId,
      role: 'user',
      content: chatRequestDto.query,
      inputTokens: 0,
      outputTokens: 0,
      metadata:
        type === 'sheets'
          ? {
              files: (chatRequestDto as SheetsRequestDto).files.map((file) => file.fileName),
            }
          : {
              schemas: Object.keys((chatRequestDto as DatabaseRequestDto).metadata.schemas),
            },
    });

    // Fetch preferred LLM provider for the user
    const preferredLLMProvider = await this.usersService.getPreferredLLMProvider(req.user.id);

    // Process the chat request based on agent type
    const result =
      type === 'sheets'
        ? await this.agentService.chatWithSheets(
            chatRequestDto.query,
            (chatRequestDto as SheetsRequestDto).files,
            conversationId,
            chatRequestDto.history,
            preferredLLMProvider
          )
        : await this.agentService.chatWithDatabase(
            chatRequestDto.query,
            (chatRequestDto as DatabaseRequestDto).metadata,
            conversationId,
            chatRequestDto.history,
            preferredLLMProvider
          );

    // Save assistant message to the conversation
    if (result.response) {
      await this.conversationsService.addMessage({
        conversationId: result.conversationId,
        role: 'assistant',
        content: result.response,
        inputTokens: result.usage?.inputTokens || 0,
        outputTokens: result.usage?.outputTokens || 0,
        metadata:
          type === 'sheets'
            ? {
                code: (result as SheetsResponseDto).code,
                newFileName: (result as SheetsResponseDto).newFileName,
              }
            : {
                sql: (result as DatabaseResponseDto).sql,
              },
      });
    }

    // Record credit usage for the user - each chat message counts as 1 credit
    await this.creditsUsageService.recordUsage(req.user.id, req.user.activePlan, 1);

    return result;
  }
}
