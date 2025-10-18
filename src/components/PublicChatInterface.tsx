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

interface PublicChatInterfaceProps {
  agent: AgentType;
}

const PublicChatInterface = ({ agent }: PublicChatInterfaceProps) => {
  const [inputValue, setInputValue] = useState("");
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  const chatHistory = useChatHistory(agent, false, false, null);
  const textChat = useTextChat({
    agent: agent,
    onUserMessage: chatHistory.addUserMessage,
    onAiMessageStart: chatHistory.startAiMessage,
    onAiTextDelta: chatHistory.addAiTextDelta,
    onAiMessageComplete: chatHistory.completeAiMessage
  });

  const handleSend = async () => {
    if (!inputValue.trim() || textChat.isProcessing) return;
    
    setHasStartedChat(true);
    const message = inputValue;
    setInputValue("");
    await textChat.sendMessage(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [chatHistory.messages]);

  // Show initial state if no messages
  if (!hasStartedChat && chatHistory.messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-4">
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
              className="w-full h-14 pr-14 text-base bg-white/95 backdrop-blur-sm border-white/30 text-foreground placeholder:text-muted-foreground rounded-2xl"
              disabled={textChat.isProcessing}
            />
            <Button
              onClick={handleSend}
              disabled={!inputValue.trim() || textChat.isProcessing}
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-xl bg-primary hover:bg-primary/90"
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
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
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
                  <Avatar className="h-8 w-8 flex-shrink-0 border-2 border-white/30">
                    <AvatarImage src={getAvatarUrl(agent.avatar)} alt={agent.name} />
                    <AvatarFallback className="bg-white/20 text-white text-xs">
                      {agent.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`flex-1 ${message.role === 'user' ? 'flex justify-end' : ''}`}>
                  <div className={`
                    ${message.role === 'user' 
                      ? 'bg-primary/90 text-white rounded-3xl px-4 py-3 inline-block max-w-[80%]' 
                      : 'bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 w-full'
                    }
                  `}>
                    {message.role === 'user' ? (
                      <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                    ) : (
                      <div className="prose prose-sm max-w-none prose-invert
                        prose-p:leading-7 prose-p:mb-5 prose-p:mt-0 prose-p:text-[15px] first:prose-p:mt-0 last:prose-p:mb-0
                        prose-headings:font-semibold prose-headings:my-4
                        prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
                        prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6
                        prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6
                        prose-li:my-1 prose-li:leading-7 prose-li:text-[15px]
                        prose-strong:font-semibold prose-strong:text-white
                        prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                        prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-lg
                        prose-blockquote:border-l-4 prose-blockquote:border-border prose-blockquote:pl-4 prose-blockquote:italic
                        prose-a:text-primary prose-a:underline hover:prose-a:text-primary/80
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
                <AvatarImage src={getAvatarUrl(agent.avatar)} alt={agent.name} />
                <AvatarFallback className="bg-white/20 text-white text-xs">
                  {agent.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 inline-block">
                  <div className="flex space-x-1.5">
                    <div className="w-2 h-2 rounded-full bg-white/60 animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 rounded-full bg-white/60 animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 rounded-full bg-white/60 animate-bounce"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="flex-shrink-0 p-4">
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={textChat.isProcessing ? `${agent.name} is typing...` : `Message ${agent.name}...`}
              className="w-full h-14 pr-14 text-base bg-white/95 backdrop-blur-sm border-white/30 text-foreground placeholder:text-muted-foreground rounded-2xl"
              disabled={textChat.isProcessing}
            />
            <Button
              onClick={handleSend}
              disabled={!inputValue.trim() || textChat.isProcessing}
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-xl bg-primary hover:bg-primary/90"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicChatInterface;
