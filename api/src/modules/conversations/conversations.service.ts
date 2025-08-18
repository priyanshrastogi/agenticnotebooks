import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Conversation } from '@/common/entities/conversation.entity';
import { ConversationMessage } from '@/common/entities/conversation-message.entity';

import {
  AddMessageDto,
  ConversationDto,
  ConversationMessageDto,
  UpdateConversationDto,
} from './dto';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(Conversation)
    private conversationsRepository: Repository<Conversation>,
    @InjectRepository(ConversationMessage)
    private conversationMessagesRepository: Repository<ConversationMessage>,
  ) {}

  /**
   * Find all conversations for a user
   * Returns only conversation summaries without messages
   */
  async findAllByUserId(userId: string): Promise<ConversationDto[]> {
    const conversations = await this.conversationsRepository.find({
      where: { userId },
      order: { lastMessageAt: 'DESC' },
    });

    return conversations.map((conversation) => this.mapToDto(conversation));
  }

  /**
   * Find a conversation by ID
   * Returns the conversation with its messages
   */
  async findById(id: string, userId: string): Promise<ConversationDto> {
    const conversation = await this.conversationsRepository.findOne({
      where: { id, userId },
    });

    if (!conversation) {
      throw new NotFoundException(`Conversation with ID ${id} not found`);
    }

    // Fetch messages separately
    const messages = await this.conversationMessagesRepository.find({
      where: { conversationId: id },
      order: { createdAt: 'ASC' },
    });

    // Create conversation DTO
    const conversationDto = this.mapToDto(conversation);

    // Add messages to the DTO
    conversationDto.messages = messages.map((message) =>
      this.mapToMessageDto(message),
    );

    return conversationDto;
  }

  /**
   * Create a new conversation
   */
  async create(userId: string, title?: string): Promise<ConversationDto> {
    const conversation = this.conversationsRepository.create({
      userId,
      title: title || 'New Conversation',
    });

    const saved = await this.conversationsRepository.save(conversation);
    return this.mapToDto(saved);
  }

  /**
   * Update a conversation
   */
  async update(
    id: string,
    userId: string,
    data: UpdateConversationDto,
  ): Promise<ConversationDto> {
    const entity = await this.conversationsRepository.findOne({
      where: { id, userId },
    });

    if (!entity) {
      throw new NotFoundException(`Conversation with ID ${id} not found`);
    }

    // Apply updates
    if (data.title !== undefined) {
      entity.title = data.title;
    }

    const saved = await this.conversationsRepository.save(entity);
    return this.mapToDto(saved);
  }

  /**
   * Delete a conversation
   */
  async delete(id: string, userId: string): Promise<void> {
    const conversation = await this.conversationsRepository.findOne({
      where: { id, userId },
    });

    if (!conversation) {
      throw new NotFoundException(`Conversation with ID ${id} not found`);
    }

    await this.conversationsRepository.remove(conversation);
  }

  /**
   * Add a message to a conversation
   */
  async addMessage(params: AddMessageDto): Promise<ConversationMessageDto> {
    const conversation = await this.conversationsRepository.findOne({
      where: { id: params.conversationId },
    });

    if (!conversation) {
      throw new NotFoundException(
        `Conversation with ID ${params.conversationId} not found`,
      );
    }

    // Update last message timestamp
    conversation.lastMessageAt = new Date();
    await this.conversationsRepository.save(conversation);

    // Create and save the message
    const message = this.conversationMessagesRepository.create({
      conversationId: params.conversationId,
      role: params.role,
      content: params.content,
      inputTokens: params.inputTokens || 0,
      outputTokens: params.outputTokens || 0,
      metadata: params.metadata,
    });

    const savedMessage =
      await this.conversationMessagesRepository.save(message);
    return this.mapToMessageDto(savedMessage);
  }

  /**
   * Get all messages for a conversation
   */
  async getMessages(
    conversationId: string,
    userId: string,
  ): Promise<ConversationMessageDto[]> {
    // First check if the conversation belongs to the user
    const conversation = await this.conversationsRepository.findOne({
      where: { id: conversationId, userId },
    });

    if (!conversation) {
      throw new NotFoundException(
        `Conversation with ID ${conversationId} not found`,
      );
    }

    const messages = await this.conversationMessagesRepository.find({
      where: { conversationId },
      order: { createdAt: 'ASC' },
    });

    return messages.map((message) => this.mapToMessageDto(message));
  }

  /**
   * Map entity to DTO
   */
  private mapToDto(conversation: Conversation): ConversationDto {
    return {
      id: conversation.id,
      userId: conversation.userId,
      title: conversation.title,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      lastMessageAt: conversation.lastMessageAt,
      metadata: conversation.metadata,
    };
  }

  /**
   * Map message entity to DTO
   */
  private mapToMessageDto(
    message: ConversationMessage,
  ): ConversationMessageDto {
    return {
      id: message.id,
      conversationId: message.conversationId,
      role: message.role,
      content: message.content,
      inputTokens: message.inputTokens,
      outputTokens: message.outputTokens,
      createdAt: message.createdAt,
      metadata: message.metadata,
    };
  }
}
