'use client';

import ChatInput from './ChatInput';
import FreeMessageNotification from './FreeMessageNotification';
import MessageList, { type Message } from './MessageList';

type ChatPanelProps = {
  messages: Message[];
  inputMessage: string;
  setInputMessage: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  openAuthModal?: () => void;
};

export default function ChatPanel({
  messages,
  inputMessage,
  setInputMessage,
  handleSubmit,
  isLoading,
  openAuthModal,
}: ChatPanelProps) {
  return (
    <div className="flex h-full w-1/3 flex-col border-r">
      <MessageList messages={messages} isLoading={isLoading} />
      <FreeMessageNotification />
      <ChatInput
        inputMessage={inputMessage}
        setInputMessage={setInputMessage}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        openAuthModal={openAuthModal}
      />
    </div>
  );
}
