
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
    <form onSubmit={handleSubmit} className="flex gap-3 p-6">
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={disabled ? "Connecting..." : "Type a message..."}
        disabled={disabled}
        className="flex-1 bg-bg/50 border-border/50 focus:border-brandBlue/50 focus:ring-brandBlue/20"
      />
      <Button 
        type="submit" 
        disabled={!message.trim() || disabled}
        className="px-6 bg-gradient-to-r from-brandBlue to-brandPurple hover:from-brandBlue/90 hover:to-brandPurple/90"
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
};
