
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-4 border-t border-border/20 bg-bg/80 backdrop-blur-xl">
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        disabled={disabled}
        className="flex-1"
      />
      <Button 
        type="submit" 
        disabled={!message.trim() || disabled}
        className="px-4"
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
};
