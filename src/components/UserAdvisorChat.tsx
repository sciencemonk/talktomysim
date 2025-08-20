
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Send, User, Bot } from "lucide-react";
import { UserAdvisor } from "@/services/userAdvisorService";
import { useChatHistory } from "@/hooks/useChatHistory";
import { useTextChat } from "@/hooks/useTextChat";

interface UserAdvisorChatProps {
  advisor: UserAdvisor;
}

const UserAdvisorChat = ({ advisor }: UserAdvisorChatProps) => {
  const [inputMessage, setInputMessage] = useState("");
  const {
    messages,
    isLoading: messagesLoading,
    addUserMessage,
    startAiMessage,
    addAiTextDelta,
    completeAiMessage
  } = useChatHistory(advisor);

  const { sendMessage, isLoading: sendingMessage } = useTextChat(
    advisor.prompt,
    addUserMessage,
    startAiMessage,
    addAiTextDelta,
    completeAiMessage
  );

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || sendingMessage) return;

    const message = inputMessage.trim();
    setInputMessage("");
    
    await sendMessage(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (messagesLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse">Loading chat...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="border-b p-4 bg-background">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={advisor.avatar_url} alt={advisor.name} />
            <AvatarFallback>
              {advisor.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-lg">{advisor.name}</h2>
            {advisor.title && (
              <p className="text-sm text-muted-foreground">{advisor.title}</p>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 && (
            <Card className="p-6 text-center">
              <div className="space-y-2">
                <Avatar className="h-16 w-16 mx-auto">
                  <AvatarImage src={advisor.avatar_url} alt={advisor.name} />
                  <AvatarFallback className="text-lg">
                    {advisor.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-semibold text-lg">{advisor.name}</h3>
                {advisor.description && (
                  <p className="text-muted-foreground">{advisor.description}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  Start a conversation with your advisor!
                </p>
              </div>
            </Card>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'system' && (
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarImage src={advisor.avatar_url} alt={advisor.name} />
                  <AvatarFallback>
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
              
              <Card className={`max-w-[80%] p-3 ${
                message.role === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                {!message.isComplete && (
                  <div className="mt-2">
                    <div className="animate-pulse text-xs">Typing...</div>
                  </div>
                )}
              </Card>
              
              {message.role === 'user' && (
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t p-4 bg-background">
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={sendingMessage}
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || sendingMessage}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserAdvisorChat;
