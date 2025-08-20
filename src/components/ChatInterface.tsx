
import { useRealtimeChat } from "@/hooks/useRealtimeChat";
import { TextInput } from "@/components/TextInput";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AgentType } from "@/types/agent";

interface ChatInterfaceProps {
  agent: AgentType;
  onShowAgentDetails?: () => void;
}

const ChatInterface = ({ agent, onShowAgentDetails }: ChatInterfaceProps) => {
  const realtimeChat = useRealtimeChat({ agent });

  // Combine messages with current partial message if speaking
  const allMessages = [...realtimeChat.messages];
  if (realtimeChat.currentMessage && realtimeChat.isSpeaking) {
    allMessages.push({
      id: 'current',
      role: 'system' as const,
      content: realtimeChat.currentMessage,
      timestamp: new Date(),
      isComplete: false
    });
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header - ChatGPT style */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={agent.avatar} alt={agent.name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-semibold text-base">{agent.name}</h1>
              <p className="text-xs text-muted-foreground">{agent.type} • {agent.subject || 'General'}</p>
            </div>
          </div>
          
          {onShowAgentDetails && (
            <Button variant="ghost" size="sm" onClick={onShowAgentDetails} className="gap-1.5 text-xs">
              <Settings className="h-3 w-3" />
              Edit
            </Button>
          )}
        </div>
      </div>

      {/* Chat Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto">
          {allMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center px-6">
              <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center mb-4">
                <Bot className="h-6 w-6 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">How can I help you today?</h2>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                {realtimeChat.connectionStatus === 'connecting' 
                  ? 'Getting ready to chat...' 
                  : realtimeChat.connectionStatus === 'error'
                  ? 'Connection error - please refresh'
                  : `I'm ${agent.name}, ready to help you learn and explore ideas together.`
                }
              </p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto px-6 py-8 w-full">
              <div className="space-y-8">
                {allMessages.map((message) => (
                  <div key={message.id} className="flex gap-4">
                    {message.role === 'system' && (
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={agent.avatar} alt={agent.name} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    {message.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium">You</span>
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="prose prose-sm max-w-none">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words mb-0">
                          {message.content}
                        </p>
                      </div>
                      
                      {!message.isComplete && message.role === 'system' && (
                        <div className="flex items-center gap-1 mt-2">
                          <div className="w-1 h-1 bg-muted-foreground rounded-full animate-pulse" />
                          <div className="w-1 h-1 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                          <div className="w-1 h-1 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Input Area */}
        <div className="border-t bg-background flex-shrink-0">
          <TextInput
            onSendMessage={realtimeChat.sendTextMessage}
            disabled={!realtimeChat.isConnected}
            placeholder={
              !realtimeChat.isConnected 
                ? "Connecting..." 
                : `Message ${agent.name}...`
            }
          />
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
