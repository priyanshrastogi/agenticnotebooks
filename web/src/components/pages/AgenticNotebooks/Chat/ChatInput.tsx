'use client';

import { Send } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useCredits } from '@/lib/hooks/use-credits';
import { useUser } from '@/lib/hooks/use-user';

type ChatInputProps = {
  inputMessage: string;
  setInputMessage: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  openAuthModal?: () => void;
};

export default function ChatInput({
  inputMessage,
  setInputMessage,
  handleSubmit,
  isLoading,
  openAuthModal,
}: ChatInputProps) {
  const { user } = useUser();
  const credits = useCredits();

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user && openAuthModal) {
      openAuthModal();
      return;
    }
    handleSubmit(e);
  };

  return (
    <div className="border-border border-t p-4">
      <form onSubmit={handleFormSubmit} className="relative">
        <Textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ask about your spreadsheet data..."
          className="bg-secondary/30 border-input text-foreground placeholder:text-muted-foreground h-12 resize-none rounded-2xl py-3 pr-12 focus-visible:ring-0 focus-visible:ring-offset-0"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleFormSubmit(e);
            }
          }}
        />
        <Button
          type="submit"
          size="icon"
          className="bg-primary hover:bg-primary/90 text-primary-foreground absolute right-2 top-2 h-8 w-8 rounded-full"
          disabled={!inputMessage.trim() || isLoading || credits.isRateLimited}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
