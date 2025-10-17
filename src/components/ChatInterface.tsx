
import { useState, useEffect, useRef } from "react";
import { Bot, ChevronLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/TextInput";
import { useChatHistory } from "@/hooks/useChatHistory";
import { useTextChat } from "@/hooks/useTextChat";
import { useIsMobile } from "@/hooks/use-mobile";
import { useIOSKeyboard } from "@/hooks/useIOSKeyboard";
import { AgentType } from "@/types/agent";

interface ChatInterfaceProps {
  agent: AgentType;
  onBack?: () => void;
  hideHeader?: boolean;
  transparentMode?: boolean;
  isCreatorChat?: boolean;
  forceNewChat?: boolean;
  conversationId?: string | null;
}

const ChatInterface = ({ agent, onBack, hideHeader = false, transparentMode = false, isCreatorChat = false, forceNewChat = false, conversationId = null }: ChatInterfaceProps) => {
  const [currentAgent, setCurrentAgent] = useState(agent);
  const [isAiResponding, setIsAiResponding] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const { isKeyboardVisible, viewportHeight } = useIOSKeyboard();
  
  const chatHistory = useChatHistory(currentAgent, isCreatorChat, forceNewChat, conversationId);
  const textChat = useTextChat({
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
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory.messages]);

  return (
    <div 
      className={`flex flex-col w-full h-full ${
        transparentMode ? 'bg-transparent' : 'bg-background'
      }`}
    >
      {/* Header with advisor info and back button - Flex header */}
      {!hideHeader && (
        <div className={`flex-shrink-0 px-4 py-3 z-50 ${
          transparentMode ? 'border-b-0' : 'border-b bg-background'
        }`}>
          <div className="flex items-center gap-3">
            {onBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="p-2 h-auto"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
            <Avatar className="h-10 w-10">
              <AvatarImage src={currentAgent.avatar} alt={currentAgent.name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                <Bot className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-semibold truncate">{currentAgent.name}</h1>
              <p className="text-sm text-muted-foreground truncate">
                {currentAgent.title || currentAgent.subject || currentAgent.type}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Messages - Flex-1 scrollable area */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto min-h-0 bg-background">
        {chatHistory.messages.length === 0 && !textChat.isProcessing ? (
          <div className="h-full flex flex-col items-center justify-center px-4">
            <h1 className="text-3xl md:text-4xl font-semibold text-foreground">
              How may I help you?
            </h1>
          </div>
        ) : (
          <div className="py-8">
            <div className="max-w-3xl mx-auto px-4 space-y-6">
              {chatHistory.messages.map((message) => {
                // Don't render AI messages that are incomplete and have no content
                if (message.role === 'system' && !message.isComplete && !message.content.trim()) {
                  return null;
                }
                
                return (
                  <div
                    key={message.id}
                    className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {message.role === 'system' && (
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={currentAgent.avatar} alt={currentAgent.name} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {currentAgent.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className={`flex-1 ${message.role === 'user' ? 'flex justify-end' : ''}`}>
                      <div className={`
                        ${message.role === 'user' 
                          ? 'bg-primary text-primary-foreground rounded-3xl px-4 py-3 inline-block max-w-[80%]' 
                          : 'w-full'
                        }
                      `}>
                        {message.role === 'user' ? (
                          <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                        ) : (
                          <div className="prose prose-sm max-w-none dark:prose-invert
                            prose-p:leading-7 prose-p:my-4 prose-p:text-[15px]
                            prose-headings:font-semibold prose-headings:my-4
                            prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
                            prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6
                            prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6
                            prose-li:my-1 prose-li:leading-7 prose-li:text-[15px]
                            prose-strong:font-semibold prose-strong:text-foreground
                            prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                            prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-lg
                            prose-blockquote:border-l-4 prose-blockquote:border-border prose-blockquote:pl-4 prose-blockquote:italic
                            prose-a:text-primary prose-a:underline hover:prose-a:text-primary/80
                          ">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {message.role === 'user' && (
                      <div className="w-8 flex-shrink-0" />
                    )}
                  </div>
                );
              })}
              
              {/* Typing indicator */}
              {textChat.isProcessing && (
                <div className="flex gap-4">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={currentAgent.avatar} alt={currentAgent.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {currentAgent.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex space-x-1.5 py-3">
                      <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}
      </div>

      {/* Input - Fixed at bottom */}
      <div className="flex-shrink-0 p-4 bg-background border-t">
        <div className="max-w-3xl mx-auto">
          <TextInput 
            onSendMessage={textChat.sendMessage}
            disabled={textChat.isProcessing || isAiResponding}
            placeholder={isAiResponding ? `${currentAgent.name} is typing...` : `Message ${currentAgent.name}...`}
            transparentMode={false}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
