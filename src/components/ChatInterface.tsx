
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
import { useNavigate, useSearchParams } from "react-router-dom";
import { X402PaymentModal } from "@/components/X402PaymentModal";

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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const { isKeyboardVisible, viewportHeight } = useIOSKeyboard();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get avatar URL - handle both transformed (avatar) and raw (avatar_url) properties
  const avatarUrl = (currentAgent as any).avatar || (currentAgent as any).avatar_url;
  
  const chatHistory = useChatHistory(currentAgent, forceNewChat, conversationId);
  const textChat = useTextChat({
    agent: currentAgent,
    onUserMessage: chatHistory.addUserMessage,
    onAiMessageStart: chatHistory.startAiMessage,
    onAiTextDelta: chatHistory.addAiTextDelta,
    onAiMessageComplete: chatHistory.completeAiMessage,
    // Only include completed messages in the history
    existingMessages: chatHistory.messages
      .filter(msg => msg.isComplete)
      .map(msg => ({ 
        role: msg.role, 
        content: msg.content 
      }))
  });

  useEffect(() => {
    setCurrentAgent(agent);
    
    // Check if payment is required and if user has valid session
    if (agent.x402_enabled && agent.x402_price && agent.x402_wallet) {
      const storedSessionId = localStorage.getItem(`x402_session_${agent.x402_wallet}`);
      if (storedSessionId) {
        setSessionId(storedSessionId);
      } else if (!isCreatorChat) {
        // Show payment modal if not creator
        setShowPaymentModal(true);
      }
    }
  }, [agent, isCreatorChat]);
  
  // Clean up URL after welcome message is displayed when restarting
  useEffect(() => {
    if (forceNewChat && chatHistory.messages.length > 0) {
      // Once we have messages (welcome message), remove the new=true parameter
      const simId = searchParams.get('sim');
      if (simId && searchParams.get('new') === 'true') {
        console.log('🧹 Cleaning up new=true parameter after displaying welcome message');
        navigate(`/home?sim=${simId}`, { replace: true });
      }
    }
  }, [forceNewChat, chatHistory.messages.length, searchParams, navigate]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory.messages]);

  const handlePaymentSuccess = (newSessionId: string) => {
    setSessionId(newSessionId);
    setShowPaymentModal(false);
  };

  // Show payment modal if payment required and no valid session
  if (currentAgent.x402_enabled && !sessionId && !isCreatorChat) {
    return (
      <>
        <X402PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onPaymentSuccess={handlePaymentSuccess}
          simName={currentAgent.name}
          price={currentAgent.x402_price || 0.01}
          walletAddress={currentAgent.x402_wallet || ''}
        />
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Payment required to access this chat</p>
        </div>
      </>
    );
  }

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
              <AvatarImage src={avatarUrl} alt={currentAgent.name} className="object-cover" />
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
      <div ref={messagesContainerRef} className={`flex-1 overflow-y-auto min-h-0 ${transparentMode ? 'bg-transparent' : 'bg-background'}`}>
        <div className="py-8">
          <div className="max-w-3xl mx-auto px-4 space-y-6">
            {chatHistory.messages.map((message) => {
                // Don't render AI messages that are incomplete and have no content
                if ((message.role === 'assistant' || message.role === 'system') && !message.isComplete && !message.content.trim()) {
                  return null;
                }
                
                // Check if message has an image
                const hasImage = (message as any).image;
                
                return (
                  <div
                    key={message.id}
                    className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {(message.role === 'assistant' || message.role === 'system') && (
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={avatarUrl} alt={currentAgent.name} className="object-cover" />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {currentAgent.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className={`flex-1 ${message.role === 'user' ? 'flex justify-end' : ''}`}>
                      <div className={`
                        ${message.role === 'user' 
                          ? `${transparentMode ? 'bg-[#83f1aa] text-black' : 'bg-[#83f1aa] text-black'} rounded-3xl px-4 py-3 inline-block max-w-[80%]` 
                          : `w-full ${transparentMode ? 'bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3' : ''}`
                        }
                      `}>
                        {message.role === 'user' ? (
                          <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                        ) : (
                          <>
                            <div className={`prose prose-sm max-w-none break-words overflow-wrap-anywhere ${transparentMode ? 'prose-invert' : 'dark:prose-invert'}
                              prose-p:leading-7 prose-p:mb-5 prose-p:mt-0 prose-p:text-[15px] prose-p:break-words first:prose-p:mt-0 last:prose-p:mb-0
                              prose-headings:font-semibold prose-headings:my-4
                              prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
                              prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6
                              prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6
                              prose-li:my-1 prose-li:leading-7 prose-li:text-[15px] prose-li:break-words
                              ${transparentMode ? 'prose-strong:font-semibold prose-strong:text-white' : 'prose-strong:font-semibold prose-strong:text-foreground'}
                              prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:break-all
                              prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-lg
                              prose-blockquote:border-l-4 prose-blockquote:border-border prose-blockquote:pl-4 prose-blockquote:italic
                              prose-a:text-primary prose-a:underline prose-a:break-words hover:prose-a:text-primary/80
                            `}>
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  p: ({ children }) => <p className="mb-5 last:mb-0">{children}</p>
                                }}
                              >
                                {message.content.replace(/\n(?!\n)/g, '\n\n')}
                              </ReactMarkdown>
                            </div>
                            {hasImage && (
                              <div className="mt-4">
                                <img 
                                  src={(message as any).image}
                                  alt="Generated image"
                                  className="max-w-full rounded-lg shadow-lg"
                                />
                              </div>
                            )}
                          </>
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
                    <AvatarImage src={avatarUrl} alt={currentAgent.name} className="object-cover" />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {currentAgent.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex space-x-1.5 py-3">
                      <div className="w-2 h-2 rounded-full bg-[#82f2aa] animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-2 h-2 rounded-full bg-[#82f2aa] animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 rounded-full bg-[#82f2aa] animate-bounce"></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>
      </div>

      {/* Input - Fixed at bottom */}
      <div className={`flex-shrink-0 p-4 ${transparentMode ? 'bg-transparent border-t-0' : 'bg-background border-t'}`}>
        <div className="max-w-3xl mx-auto">
          <TextInput 
            onSendMessage={textChat.sendMessage}
            disabled={textChat.isProcessing || isAiResponding}
            placeholder={isAiResponding ? `${currentAgent.name} is typing...` : `Message ${currentAgent.name}...`}
            transparentMode={transparentMode}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
