import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChatHistory } from "@/hooks/useChatHistory";
import { useTextChat } from "@/hooks/useTextChat";
import { AgentType } from "@/types/agent";
import { getAvatarUrl } from "@/lib/avatarUtils";
import { X402PaymentModal } from "@/components/X402PaymentModal";

interface PublicChatInterfaceProps {
  agent: AgentType;
}

const PublicChatInterface = ({ agent }: PublicChatInterfaceProps) => {
  const [inputValue, setInputValue] = useState("");
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const lastAssistantMessageRef = useRef<HTMLDivElement>(null);
  
  const chatHistory = useChatHistory(agent, false, null);
  const textChat = useTextChat({
    agent: agent,
    onUserMessage: chatHistory.addUserMessage,
    onAiMessageStart: chatHistory.startAiMessage,
    onAiTextDelta: chatHistory.addAiTextDelta,
    onAiMessageComplete: chatHistory.completeAiMessage,
    existingMessages: chatHistory.messages.map(msg => ({ 
      role: msg.role, 
      content: msg.content 
    }))
  });

  // Check for x402 payment requirement
  useEffect(() => {
    if (agent.x402_enabled && agent.x402_price && agent.x402_wallet) {
      const storedSessionId = localStorage.getItem(`x402_session_${agent.x402_wallet}`);
      if (storedSessionId) {
        setSessionId(storedSessionId);
      } else {
        setShowPaymentModal(true);
      }
    }
  }, [agent]);

  const handleSend = async () => {
    if (!inputValue.trim() || textChat.isProcessing) return;
    
    // Check if payment is required
    if (agent.x402_enabled && !sessionId) {
      setShowPaymentModal(true);
      return;
    }
    
    setHasStartedChat(true);
    const message = inputValue;
    setInputValue("");
    await textChat.sendMessage(message);
  };

  const handlePaymentSuccess = (newSessionId: string) => {
    setSessionId(newSessionId);
    setShowPaymentModal(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    // Get the last message
    const lastMessage = chatHistory.messages[chatHistory.messages.length - 1];
    
    // If last message is from assistant/system, scroll to show it from the top
    if ((lastMessage?.role === 'assistant' || lastMessage?.role === 'system') && lastAssistantMessageRef.current) {
      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(() => {
        lastAssistantMessageRef.current?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest'
        });
      });
    } 
    // For user messages, scroll to bottom to see the user's message
    else if (lastMessage?.role === 'user' && messagesContainerRef.current) {
      requestAnimationFrame(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
      });
    }
  }, [chatHistory.messages, chatHistory.messages.length]);

  // Show loading state while chat history is loading
  if (chatHistory.isLoading) {
    return null;
  }

  // Show payment modal if required and no valid session
  if (agent.x402_enabled && !sessionId) {
    return (
      <>
        <X402PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onPaymentSuccess={handlePaymentSuccess}
          simName={agent.name}
          price={agent.x402_price || 0.01}
          walletAddress={agent.x402_wallet || ''}
        />
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Payment required to access this chat</p>
        </div>
      </>
    );
  }

  // Show initial state if no messages
  if (!hasStartedChat && chatHistory.messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full px-4">
        <div className="w-full max-w-2xl space-y-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white text-center">
            How may I help you?
          </h1>
          
          <div className="relative">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${agent.name}...`}
              className="w-full h-14 pr-14 text-base bg-card/95 backdrop-blur-sm border-border text-foreground placeholder:text-muted-foreground rounded-2xl"
              disabled={textChat.isProcessing}
            />
            <Button
              onClick={handleSend}
              disabled={!inputValue.trim() || textChat.isProcessing}
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-xl bg-[#83f1aa] hover:bg-[#83f1aa]/90 text-black"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show chat interface once conversation has started
  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
          {chatHistory.messages.map((message, index) => {
            // Don't render AI messages that are incomplete and have no content
            if ((message.role === 'assistant' || message.role === 'system') && !message.isComplete && !message.content.trim()) {
              return null;
            }
            
            const isLastAssistantMessage = 
              (message.role === 'assistant' || message.role === 'system') && 
              index === chatHistory.messages.length - 1;
            
            return (
              <div
                key={message.id}
                ref={isLastAssistantMessage ? lastAssistantMessageRef : null}
                className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} min-w-0`}
              >
                {(message.role === 'assistant' || message.role === 'system') && (
                  <Avatar className="h-8 w-8 flex-shrink-0 border-2 border-white/30">
                    <AvatarImage src={getAvatarUrl(agent.avatar)} alt={agent.name} className="object-cover" />
                    <AvatarFallback className="bg-white/20 text-white text-xs">
                      {agent.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`flex-1 min-w-0 ${message.role === 'user' ? 'flex justify-end' : ''}`}>
                  <div className={`
                    ${message.role === 'user' 
                      ? 'bg-[#83f1aa] text-black rounded-3xl px-4 py-3 inline-block max-w-[80%] break-words overflow-hidden' 
                      : 'bg-card border border-border rounded-2xl px-4 py-3 w-full text-foreground overflow-hidden'
                    }
                  `}>
                    {message.role === 'user' ? (
                      <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                    ) : (
                      <div className="prose prose-sm max-w-none break-words overflow-wrap-anywhere
                        prose-p:leading-7 prose-p:mb-5 prose-p:mt-0 prose-p:text-[15px] prose-p:break-words first:prose-p:mt-0 last:prose-p:mb-0
                        prose-headings:font-semibold prose-headings:my-4 prose-headings:break-words
                        prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
                        prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6
                        prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6
                        prose-li:my-1 prose-li:leading-7 prose-li:text-[15px] prose-li:break-words
                        prose-strong:font-semibold prose-strong:break-words
                        prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:break-all
                        prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto
                        prose-blockquote:border-l-4 prose-blockquote:border-border prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:break-words
                        prose-a:text-primary prose-a:underline prose-a:break-words hover:prose-a:text-primary/80
                      ">
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({ children }) => <p className="mb-5 last:mb-0">{children}</p>
                          }}
                        >
                          {message.content.replace(/\n(?!\n)/g, '\n\n')}
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
              <Avatar className="h-8 w-8 flex-shrink-0 border-2 border-white/30">
                <AvatarImage src={getAvatarUrl(agent.avatar)} alt={agent.name} className="object-cover" />
                <AvatarFallback className="bg-white/20 text-white text-xs">
                  {agent.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="bg-card border border-border rounded-2xl px-4 py-3 inline-block">
                  <div className="flex space-x-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#82f2aa] animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 rounded-full bg-[#82f2aa] animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 rounded-full bg-[#82f2aa] animate-bounce"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="flex-shrink-0 p-3 sm:p-4 bg-background/95 backdrop-blur-sm border-t">
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={textChat.isProcessing ? `${agent.name} is typing...` : `Message ${agent.name}...`}
              className="w-full h-12 sm:h-14 pr-12 sm:pr-14 text-sm sm:text-base bg-card/95 backdrop-blur-sm border-border text-foreground placeholder:text-muted-foreground rounded-2xl"
              disabled={textChat.isProcessing}
            />
            <Button
              onClick={handleSend}
              disabled={!inputValue.trim() || textChat.isProcessing}
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-[#83f1aa] hover:bg-[#83f1aa]/90 text-black"
            >
              <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicChatInterface;
