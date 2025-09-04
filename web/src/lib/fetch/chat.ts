import { type Message } from '@/components/pages/AgenticNotebooks/Chat/MessageList';
import { FileMetadata } from '@/lib/file-handling/types';

import { instance } from '../axios';

export interface ChatRequest {
  query: string;
  files: FileMetadata[];
  conversationId?: string;
  history?: {
    role: string;
    content: string;
  }[];
}

export interface ChatResponse {
  responseText: string;
  conversationId: string;
  code?: string;
  newFileName?: string;
}

export async function sendChatMessage({
  request,
  accessToken,
}: {
  request: ChatRequest;
  accessToken: string;
}): Promise<ChatResponse> {
  try {
    const response = await instance.post('/agent/sheets/chat', request, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
}

// Helper to convert frontend messages to API format
export function formatMessagesForApi(messages: Message[]): { role: string; content: string }[] {
  return messages.map((message) => ({
    role: message.sender === 'user' ? 'user' : 'assistant',
    content: message.content,
  }));
}
