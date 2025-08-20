

import { useState, useRef, useEffect } from "react";
import { useChatHistory } from "@/hooks/useChatHistory";
import { TextInput } from "@/components/TextInput";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, Settings, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AgentType } from "@/types/agent";
import AgentConfigSettings from "@/components/AgentConfigSettings";
import { useTextChat } from "@/hooks/useTextChat";

interface ChatInterfaceProps {
  agent: AgentType;
  onShowAgentDetails?: () => void;
}

// Simple markdown parser for basic formatting
const parseMarkdown = (text: string) => {
  return text
    // Bold text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Headers
    .replace(/^### (.*$)/gm, '<h3 class="text-base font-semibold mt-4 mb-2">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-lg font-semibold mt-4 mb-2">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="text-xl font-semibold mt-4 mb-2">$1</h1>')
    // Line breaks
    .replace(/\n/g, '<br>');
};

const ChatInterface = ({ agent, onShowAgentDetails }: ChatInterfaceProps) => {
  const [showSettings, setShowSettings] = useState(false);
  const [currentAgent, setCurrentAgent] = useState(agent);
  const [isAiResponding, setIsAiResponding] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const chatHistory = useChatHistory(currentAgent);
  const textChat = useTextChat({ 
    agent: currentAgent,
    onUserMessage: chatHistory.addUserMessage,
    onAiMessageStart: () => {
      setIsAiResponding(true);
      return chatHistory.startAiMessage();
    },
    onAiTextDelta: chatHistory.addAiTextDelta,
    onAiMessageComplete: (messageId: string) => {
      chatHistory.completeAiMessage(messageId);
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
  };

  const handleShowSettings = () => {
    setShowSettings(true);
  };

  const handleBackToChat = () => {
    setShowSettings(false);
  };

  const handleSendMessage = (message: string) => {
    console.log('Sending message:', message);
    textChat.sendMessage(message);
  };

  if (showSettings) {
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={handleBackToChat} className="gap-1.5 text-xs">
                <ArrowLeft className="h-3 w-3" />
                Back to Chat
              </Button>
              <Avatar className="h-8 w-8">
                <AvatarImage src={currentAgent.avatar} alt={currentAgent.name} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="font-semibold text-base">{currentAgent.name} Settings</h1>
                <p className="text-xs text-muted-foreground">Configure your thinking partner</p>
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
              <Avatar className="h-8 w-8">
                <AvatarImage src={currentAgent.avatar} alt={currentAgent.name} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="font-semibold text-base">{currentAgent.name}</h1>
                <p className="text-xs text-muted-foreground">{currentAgent.type} • {currentAgent.subject || 'General'}</p>
              </div>
            </div>
            
            <Button variant="ghost" size="sm" onClick={handleShowSettings} className="gap-1.5 text-xs">
              <Settings className="h-3 w-3" />
              Edit
            </Button>
          </div>
        </div>

        {/* Loading state */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Loading chat history...</p>
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
            <Avatar className="h-8 w-8">
              <AvatarImage src={currentAgent.avatar} alt={currentAgent.name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-semibold text-base">{currentAgent.name}</h1>
              <p className="text-xs text-muted-foreground">{currentAgent.type} • {currentAgent.subject || 'General'}</p>
            </div>
          </div>
          
          <Button variant="ghost" size="sm" onClick={handleShowSettings} className="gap-1.5 text-xs">
            <Settings className="h-3 w-3" />
            Edit
          </Button>
        </div>
      </div>

      {/* Chat Messages Area - Scrollable */}
      <div className="flex-1 overflow-y-auto pb-4">
        {chatHistory.messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center px-6">
            <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center mb-4">
              <Bot className="h-6 w-6 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">How can I help you today?</h2>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              {textChat.connectionStatus === 'connecting' 
                ? 'Getting ready to chat...' 
                : textChat.connectionStatus === 'error'
                ? 'Connection error - please refresh'
                : `I'm ${currentAgent.name}, ready to help you learn and explore ideas together.`
              }
            </p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto px-6 py-8 w-full">
            <div className="space-y-6">
              {chatHistory.messages.map((message) => (
                <div key={message.id} className="flex gap-4">
                  {message.role === 'system' && (
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={currentAgent.avatar} alt={currentAgent.name} />
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
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <div 
                        className="text-sm leading-relaxed break-words"
                        dangerouslySetInnerHTML={{ 
                          __html: parseMarkdown(message.content) 
                        }}
                      />
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
              
              {/* Show typing indicator when AI is responding but no incomplete message exists */}
              {isAiResponding && !chatHistory.messages.some(msg => !msg.isComplete && msg.role === 'system') && (
                <div className="flex gap-4">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={currentAgent.avatar} alt={currentAgent.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mt-2">
                      <div className="w-1 h-1 bg-muted-foreground rounded-full animate-pulse" />
                      <div className="w-1 h-1 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                      <div className="w-1 h-1 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
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

