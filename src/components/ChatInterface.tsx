
import { useState, useRef, useEffect } from "react";
import { useChatHistory } from "@/hooks/useChatHistory";
import { TextInput } from "@/components/TextInput";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, ArrowLeft, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AgentType } from "@/types/agent";
import AgentConfigSettings from "@/components/AgentConfigSettings";
import { useTextChat } from "@/hooks/useTextChat";
import { useIsMobile } from "@/hooks/use-mobile";
import { SidebarContent } from "@/components/UserSidebar";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

interface ChatInterfaceProps {
  agent: AgentType;
  onBack?: () => void;
  onShowAgentDetails?: () => void;
  onAgentUpdate?: (updatedAgent: AgentType) => void;
}

// Simple markdown parser for basic formatting
const parseMarkdown = (text: string) => {
  return text
    // Bold text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Headers
    .replace(/^### (.*$)/gm, '<h3 class="text-xl font-semibold mt-4 mb-2">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-semibold mt-4 mb-2">$2</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-semibold mt-4 mb-2">$1</h1>')
    // Line breaks
    .replace(/\n/g, '<br>');
};

const ChatInterface = ({ agent, onShowAgentDetails, onAgentUpdate }: ChatInterfaceProps) => {
  const [showSettings, setShowSettings] = useState(false);
  const [currentAgent, setCurrentAgent] = useState(agent);
  const [isAiResponding, setIsAiResponding] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  const chatHistory = useChatHistory(currentAgent);
  const textChat = useTextChat({ 
    agent: currentAgent,
    onUserMessage: (message: string) => {
      // Don't add any auto-generated messages
      chatHistory.addUserMessage(message);
    },
    onAiMessageStart: () => {
      setIsAiResponding(true);
      return chatHistory.startAiMessage();
    },
    onAiTextDelta: (messageId: string, delta: string) => {
      chatHistory.addAiTextDelta(messageId, delta);
    },
    onAiMessageComplete: async (messageId: string) => {
      await chatHistory.completeAiMessage(messageId);
      setIsAiResponding(false);
    }
  });

  // Update current agent when agent prop changes
  useEffect(() => {
    if (agent.id !== currentAgent.id) {
      console.log('Agent changed from', currentAgent.name, 'to', agent.name);
      setCurrentAgent(agent);
    }
  }, [agent.id, currentAgent.id, agent.name, currentAgent.name]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory.messages]);

  const handleAgentUpdate = (updatedAgent: AgentType) => {
    setCurrentAgent(updatedAgent);
    onAgentUpdate?.(updatedAgent);
  };

  const handleBackToChat = () => {
    setShowSettings(false);
  };

  const handleSendMessage = (message: string) => {
    console.log('Sending message:', message);
    textChat.sendMessage(message);
  };

  // Check if this is a personal agent (can be edited) or public advisor (can only be shared)
  const isPersonalAgent = currentAgent.isPersonal !== false;

  // Get display text for advisor - use title if available, otherwise fall back to subject
  const getAdvisorDisplayText = (agent: AgentType) => {
    // For advisors from the advisors table, we might have a title property
    const advisorTitle = (agent as any).title;
    if (advisorTitle) {
      return advisorTitle;
    }
    // Fallback to subject or category
    return agent.subject || (agent as any).category || 'Advisor';
  };

  if (showSettings) {
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={handleBackToChat} className="gap-2 text-lg">
                <ArrowLeft className="h-5 w-5" />
                Back to Chat
              </Button>
              <Avatar className="h-12 w-12">
                <AvatarImage src={currentAgent.avatar} alt={currentAgent.name} />
                <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                  <Bot className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="font-semibold text-xl">{currentAgent.name} Settings</h1>
                <p className="text-lg text-muted-foreground">Configure your learning buddy</p>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <AgentConfigSettings 
              agent={currentAgent} 
              onAgentUpdate={handleAgentUpdate}
              showTeachingInstructions={true}
            />
          </div>
        </div>
      </div>
    );
  }

  if (chatHistory.isLoading) {
    return (
      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isMobile && (
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-2">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 p-0">
                    <SidebarContent
                      selectedPublicAdvisors={[]}
                      onSelectPublicAdvisor={() => {
                        setIsSheetOpen(false);
                      }}
                      onRemovePublicAdvisor={() => {}}
                      onShowAdvisorDirectory={() => {
                        setIsSheetOpen(false);
                      }}
                      onClose={() => setIsSheetOpen(false)}
                    />
                  </SheetContent>
                </Sheet>
              )}
              <Avatar className="h-12 w-12">
                <AvatarImage src={currentAgent.avatar} alt={currentAgent.name} />
                <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                  <Bot className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="font-semibold text-xl">{currentAgent.name}</h1>
                <p className="text-lg text-muted-foreground">{getAdvisorDisplayText(currentAgent)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading state */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-xl text-muted-foreground">Loading chat history...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header - Fixed at top */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isMobile && (
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-2">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0">
                  <SidebarContent
                    selectedPublicAdvisors={[]}
                    onSelectPublicAdvisor={() => {
                      setIsSheetOpen(false);
                    }}
                    onRemovePublicAdvisor={() => {}}
                    onShowAdvisorDirectory={() => {
                      setIsSheetOpen(false);
                    }}
                    onClose={() => setIsSheetOpen(false)}
                  />
                </SheetContent>
              </Sheet>
            )}
            <Avatar className="h-12 w-12">
              <AvatarImage src={currentAgent.avatar} alt={currentAgent.name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                <Bot className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-semibold text-xl">{currentAgent.name}</h1>
              <p className="text-lg text-muted-foreground">{getAdvisorDisplayText(currentAgent)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages Area - Scrollable */}
      <div className="flex-1 overflow-y-auto pb-4">
        {chatHistory.messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center px-6">
            <div className="text-center">
              {textChat.connectionStatus === 'connecting' && (
                <>
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-xl text-muted-foreground">Getting ready to chat...</p>
                </>
              )}
              {textChat.connectionStatus === 'error' && (
                <p className="text-xl text-muted-foreground">Connection error - please refresh</p>
              )}
              {textChat.connectionStatus === 'connected' && (
                <p className="text-xl text-muted-foreground">Say something...</p>
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto px-6 py-8 w-full">
            <div className="space-y-8">
              {chatHistory.messages.map((message) => (
                <div key={message.id} className="flex gap-4">
                  {message.role === 'system' && (
                    <Avatar className="h-12 w-12 flex-shrink-0">
                      <AvatarImage src={currentAgent.avatar} alt={currentAgent.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                        <Bot className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  {message.role === 'user' && (
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-medium">You</span>
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0 flex items-start">
                    <div className="prose prose-lg max-w-none dark:prose-invert mt-1">
                      <div 
                        className="text-xl leading-relaxed break-words font-medium"
                        dangerouslySetInnerHTML={{ 
                          __html: parseMarkdown(message.content) 
                        }}
                      />
                    </div>
                    
                    {!message.isComplete && message.role === 'system' && (
                      <div className="flex items-center gap-1 mt-3">
                        <div className="w-3 h-3 bg-muted-foreground rounded-full animate-pulse" />
                        <div className="w-3 h-3 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                        <div className="w-3 h-3 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Show typing indicator when AI is responding but no incomplete message exists */}
              {isAiResponding && !chatHistory.messages.some(msg => !msg.isComplete && msg.role === 'system') && (
                <div className="flex gap-4">
                  <Avatar className="h-12 w-12 flex-shrink-0">
                    <AvatarImage src={currentAgent.avatar} alt={currentAgent.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                      <Bot className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 flex items-start">
                    <div className="flex items-center gap-1 mt-3">
                      <div className="w-3 h-3 bg-muted-foreground rounded-full animate-pulse" />
                      <div className="w-3 h-3 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                      <div className="w-3 h-3 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Invisible div to scroll to */}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}
      </div>
      
      {/* Text Input - Fixed at bottom */}
      <div className="border-t bg-background flex-shrink-0 sticky bottom-0">
        <TextInput
          onSendMessage={handleSendMessage}
          disabled={textChat.connectionStatus !== 'connected'}
          placeholder={
            textChat.connectionStatus !== 'connected'
              ? "Connecting..." 
              : `Message ${currentAgent.name}...`
          }
        />
      </div>
    </div>
  );
};

export default ChatInterface;
