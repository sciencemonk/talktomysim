
import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Bot, Clock } from 'lucide-react';
import { conversationService, Message } from '@/services/conversationService';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: any;
  simName: string;
}

export const ChatModal: React.FC<ChatModalProps> = ({
  isOpen,
  onClose,
  conversation,
  simName,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (conversation?.id && isOpen) {
      setIsLoading(true);
      conversationService.getMessages(conversation.id)
        .then(setMessages)
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [conversation?.id, isOpen]);

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (!conversation) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-4">
          <DialogTitle className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span>
                  {conversation.is_anonymous ? 'Anonymous User' : 'User'} • {simName}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {conversation.message_count} messages
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Started {formatMessageTime(conversation.created_at)}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 min-h-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="space-y-4 p-1">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.role === 'system' && (
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={conversation.sim?.avatar} alt={simName} />
                        <AvatarFallback className="bg-primary/10">
                          <Bot className="h-4 w-4 text-primary" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="text-sm whitespace-pre-wrap">
                        {message.content}
                      </div>
                      <div className="flex items-center gap-1 mt-2 text-xs opacity-70">
                        <Clock className="h-3 w-3" />
                        {formatMessageTime(message.created_at)}
                      </div>
                    </div>
                    
                    {message.role === 'user' && (
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback className="bg-muted">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                
                {messages.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No messages in this conversation
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
