
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';

interface TextInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export const TextInput: React.FC<TextInputProps> = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto w-full">
      <form onSubmit={handleSubmit} className="relative">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? "Connecting..." : "Ask anything..."}
          disabled={disabled}
          className="min-h-[60px] max-h-[200px] pr-12 resize-none bg-background border-border focus:border-primary/50 focus:ring-primary/20"
          rows={1}
          style={{
            height: 'auto',
            minHeight: '60px',
            maxHeight: '200px',
          }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = Math.min(target.scrollHeight, 200) + 'px';
          }}
        />
        <Button 
          type="submit" 
          disabled={!message.trim() || disabled}
          size="sm"
          className="absolute right-2 bottom-2 h-8 w-8 p-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};
