import { useState, useEffect, useRef } from "react";
import { Bot, Menu } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { TextInput } from "@/components/TextInput";
import { useChatHistory } from "@/hooks/useChatHistory";
import { useEnhancedTextChat } from "@/hooks/useEnhancedTextChat";
import { useIsMobile } from "@/hooks/use-mobile";
import { AgentType } from "@/types/agent";
import { InfoModal } from "./InfoModal";

interface ChatInterfaceProps {
  agent: AgentType;
  onBack: () => void;
}

const ChatInterface = ({ agent, onBack }: ChatInterfaceProps) => {
  const [currentAgent, setCurrentAgent] = useState(agent);
  const [isAiResponding, setIsAiResponding] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  const chatHistory = useChatHistory(currentAgent);
  
  const textChat = useEnhancedTextChat({
    agent: currentAgent,
    onUserMessage: chatHistory.addUserMessage,
    onAiMessageStart: chatHistory.startAiMessage,
    onAiTextDelta: chatHistory.addAiTextDelta,
    onAiMessageComplete: chatHistory.completeAiMessage
  });

  useEffect(() => {
    setCurrentAgent(agent);
  }, [agent]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory.messages]);

  // Monitor text chat processing state for typing indicator
  useEffect(() => {
    setIsAiResponding(textChat.isProcessing);
  }, [textChat.isProcessing]);

  const SidebarContent = () => (
    <div className="w-80 bg-card border-r border-border flex flex-col h-full">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-center">
          <img 
            src="/lovable-uploads/d1283b59-7cfa-45f5-b151-4c32b24f3621.png" 
            alt="Logo" 
            className="h-8 w-8 object-contain"
          />
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="space-y-6 text-center">
          <div>
            <h2 className="text-xl font-semibold mb-2">Create your free Sim today</h2>
          </div>
          
          <Button 
            className="w-full bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 text-white hover:opacity-90 animate-pulse rounded-lg py-3"
          >
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );

  const TypingIndicator = () => (
    <div className="mb-4 flex flex-col items-start">
      <div className="rounded-lg px-3 py-2 text-sm max-w-[80%] bg-secondary text-secondary-foreground">
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  );

  const SourcesDisplay = () => {
    if (!textChat.lastSources || textChat.lastSources.length === 0) return null;

    return (
      <div className="mt-2 p-3 bg-muted/50 rounded-lg border">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-medium text-muted-foreground">Sources</h4>
          <button
            onClick={() => setShowSources(!showSources)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {showSources ? 'Hide' : 'Show'} ({textChat.lastSources.length})
          </button>
        </div>
        
        {showSources && (
          <div className="space-y-2">
            {textChat.lastSources.map((source, index) => (
              <div key={index} className="text-xs text-muted-foreground">
                <div className="font-medium">{source.title}</div>
                <div className="flex justify-between">
                  <span>{source.documentType}</span>
                  <span>Similarity: {(source.similarity * 100).toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {textChat.lastSearchMetrics && (
          <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Search time: {textChat.lastSearchMetrics.searchTime}ms</span>
              <span>Avg similarity: {(textChat.lastSearchMetrics.averageSimilarity * 100).toFixed(1)}%</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Filter out incomplete messages with no content for display
  const displayMessages = chatHistory.messages.filter(message => {
    // Show complete messages always
    if (message.isComplete) return true;
    // Show incomplete messages only if they have content
    return message.content.trim().length > 0;
  });

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">
      {/* Header - Fixed height with safe area */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-3 sm:px-6 py-3 sm:py-4 flex-shrink-0 sticky top-0 z-10">
        <div className="flex items-center w-full">
          {/* Left: Sidebar button (mobile only) */}
          {isMobile && (
            <div className="flex-shrink-0 mr-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-80">
                  <SidebarContent />
                </SheetContent>
              </Sheet>
            </div>
          )}
          
          {/* Center: Avatar and name */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
              <AvatarImage src={currentAgent.avatar} alt={currentAgent.name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                <Bot className="h-4 w-4 sm:h-5 sm:w-5" />
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h1 className="text-sm sm:text-lg font-semibold truncate">{currentAgent.name}</h1>
              <p className="text-xs text-muted-foreground truncate">
                {currentAgent.title || currentAgent.subject || currentAgent.type}
              </p>
            </div>
          </div>
          
          {/* Right: Info button */}
          <div className="flex-shrink-0 ml-2">
            <InfoModal agentName={currentAgent.name} />
          </div>
        </div>
      </div>

      {/* Messages - Flexible scrollable area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
        <div className="px-3 sm:px-4 pt-4 pb-2 min-h-full">
          <div className="space-y-3 sm:space-y-4">
            {displayMessages.map((message, index) => (
              <div key={message.id}>
                <div
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`rounded-lg px-3 py-2 text-sm max-w-[80%] sm:max-w-[75%] md:max-w-[60%] lg:max-w-[40%] xl:max-w-[30%] break-words ${
                      message.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-secondary text-secondary-foreground'
                    }`}
                    style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}
                  >
                    {message.content}
                  </div>
                </div>
                
                {/* Show sources for the last AI message */}
                {message.role === 'assistant' && 
                 index === displayMessages.length - 1 && 
                 message.isComplete && (
                  <div className="flex justify-start mt-1">
                    <div className="max-w-[80%] sm:max-w-[75%] md:max-w-[60%] lg:max-w-[40%] xl:max-w-[30%]">
                      <SourcesDisplay />
                    </div>
                  </div>
                )}
              </div>
            ))}
            {/* Show typing indicator when AI is responding and no incomplete messages are being displayed */}
            {isAiResponding && !chatHistory.messages.some(msg => !msg.isComplete && msg.content.trim().length > 0) && <TypingIndicator />}
          </div>
          <div ref={messagesEndRef} className="h-2" />
        </div>
      </div>

      {/* Input - Fixed at bottom with safe area */}
      <div className="border-t bg-background flex-shrink-0 sticky bottom-0 z-10 safe-area-bottom">
        <div className="p-2 sm:p-0">
          <TextInput 
            onSendMessage={textChat.sendMessage}
            disabled={textChat.isProcessing || isAiResponding}
            placeholder={isAiResponding ? `${currentAgent.name} is typing...` : `Message ${currentAgent.name}...`}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
