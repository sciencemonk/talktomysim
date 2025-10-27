
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';

interface TextInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  transparentMode?: boolean;
}

export const TextInput: React.FC<TextInputProps> = ({ 
  onSendMessage, 
  disabled,
  placeholder = "Ask anything...",
  transparentMode = false
}) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        // Keep focus on the textarea after sending
        setTimeout(() => {
          textareaRef.current?.focus();
        }, 0);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    // Auto-resize
    target.style.height = 'auto';
    target.style.height = Math.min(target.scrollHeight, 150) + 'px';
  };

  // Reset height when message is cleared
  useEffect(() => {
    if (!message && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [message]);

  // Auto-focus on mount and when enabled
  useEffect(() => {
    if (!disabled && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [disabled]);

  return (
    <div className="w-full p-3">
      <div className="w-full">
        <form onSubmit={handleSubmit} className="relative">
          <div className={`flex items-end gap-3 border rounded-xl p-3 shadow-sm focus-within:border-ring transition-colors ${
            transparentMode 
              ? 'bg-white/95 border-white/20' 
              : 'bg-background border-input'
          }`}>
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              onInput={handleInput}
              placeholder={placeholder}
              disabled={disabled}
              className={`flex-1 min-h-[24px] max-h-[150px] resize-none border-0 p-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:ring-0 focus:outline-none bg-transparent text-sm ${
                transparentMode 
                  ? 'text-black placeholder:text-black/50' 
                  : 'placeholder:text-muted-foreground'
              }`}
              rows={1}
            />
            <Button 
              type="submit" 
              disabled={!message.trim() || disabled}
              size="sm"
              className="h-8 w-8 p-0 flex-shrink-0 rounded-lg bg-[#83f1aa] hover:bg-[#83f1aa]/90 text-black"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
