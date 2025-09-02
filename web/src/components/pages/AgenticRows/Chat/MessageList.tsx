/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { useEffect, useRef } from 'react';

import DataVisualization from '@/components/blocks/charts-renderer';
import { cn } from '@/lib/utils';

import EmptyState from './EmptyState';
import LoadingIndicator from './LoadingIndicator';

export type Message = {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  visualization?: {
    type: string;
    data: any;
    options: any;
    title: string;
  } | null;
};

type MessageListProps = {
  messages: Message[];
  isLoading: boolean;
};

export default function MessageList({ messages, isLoading }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll to bottom when messages change or when the component mounts
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // If we're loading, show the loading indicator
  if (isLoading && messages.length === 0) {
    return <LoadingIndicator />;
  }

  if (messages.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="flex-1 space-y-6 overflow-y-auto px-4 py-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn('flex', message.sender === 'user' ? 'justify-end' : 'w-full')}
        >
          {message.sender === 'user' ? (
            <div className="max-w-[85%]">
              <div className="bg-primary text-primary-foreground rounded-2xl px-4 py-2.5 shadow-sm">
                <p className="whitespace-pre-line text-sm">{message.content}</p>
              </div>
            </div>
          ) : (
            <div className="text-foreground w-full">
              <div className="flex flex-col gap-4">
                <p className="whitespace-pre-line text-sm">{message.content}</p>
                {message.visualization && (
                  <div className="border-border mt-4 max-w-full overflow-hidden rounded-md border">
                    <DataVisualization chartConfig={message.visualization} className="w-full" />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}

      {isLoading && <LoadingIndicator />}

      {/* Invisible element to scroll to */}
      <div ref={messagesEndRef} />
    </div>
  );
}
