import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';

interface MessageWithChatLinksProps {
  content: string;
  onChatLinkClick: (conversationId: string) => void;
}

export const MessageWithChatLinks: React.FC<MessageWithChatLinksProps> = ({
  content,
  onChatLinkClick,
}) => {
  // Regex to match [view-chat:conversation-id] patterns
  const chatLinkRegex = /\[view-chat:([^\]]+)\]/g;
  
  // Split content by chat links and create elements
  const parts = [];
  let lastIndex = 0;
  let match;
  
  while ((match = chatLinkRegex.exec(content)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }
    
    // Add the clickable chat link
    const conversationId = match[1];
    parts.push(
      <Button
        key={`chat-link-${match.index}`}
        variant="link"
        size="sm"
        className="p-0 h-auto text-primary hover:text-primary/80 inline-flex items-center gap-1 mx-1"
        onClick={() => onChatLinkClick(conversationId)}
      >
        <MessageSquare className="h-3 w-3" />
        View Chat
      </Button>
    );
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add any remaining text
  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }
  
  // If no matches found, return original content
  if (parts.length === 0) {
    return <span className="whitespace-pre-wrap">{content}</span>;
  }
  
  return (
    <span className="whitespace-pre-wrap">
      {parts.map((part, index) => 
        typeof part === 'string' ? part : <React.Fragment key={index}>{part}</React.Fragment>
      )}
    </span>
  );
};
