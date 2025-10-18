import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChatHistory } from "@/hooks/useChatHistory";
import { useTextChat } from "@/hooks/useTextChat";
import { AgentType } from "@/types/agent";

interface PublicChatInterfaceProps {
  agent: AgentType;
}

const PublicChatInterface = ({ agent }: PublicChatInterfaceProps) => {
  const [inputValue, setInputValue] = useState("");
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

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-6">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Chat with Your Sim
        </h1>
        <p className="text-lg text-white/70">
          Your personal assistant and agent
        </p>
      </div>

      {/* Messages Area */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-6 pb-4">
        <div className="max-w-4xl space-y-4">
          {chatHistory.messages.map((message) => {
            // Don't render AI messages that are incomplete and have no content
            if (message.role === 'system' && !message.isComplete && !message.content.trim()) {
              return null;
            }
            
            return (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`
                  max-w-[80%] rounded-3xl px-5 py-3
                  ${message.role === 'user' 
                    ? 'bg-white text-foreground' 
                    : 'bg-white/10 backdrop-blur-sm text-white'
                  }
                `}>
                  {message.role === 'user' ? (
                    <p className="text-base leading-relaxed whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                  ) : (
                    <div className="prose prose-sm max-w-none prose-invert
                      prose-p:leading-7 prose-p:mb-4 prose-p:mt-0 prose-p:text-base first:prose-p:mt-0 last:prose-p:mb-0
                      prose-headings:font-semibold prose-headings:my-3
                      prose-h1:text-xl prose-h2:text-lg prose-h3:text-base
                      prose-ul:my-3 prose-ul:list-disc prose-ul:pl-5
                      prose-ol:my-3 prose-ol:list-decimal prose-ol:pl-5
                      prose-li:my-1 prose-li:leading-7 prose-li:text-base
                      prose-strong:font-semibold prose-strong:text-white
                      prose-code:bg-white/20 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                      prose-pre:bg-white/20 prose-pre:p-4 prose-pre:rounded-lg
                      prose-blockquote:border-l-4 prose-blockquote:border-white/40 prose-blockquote:pl-4 prose-blockquote:italic
                      prose-a:text-white prose-a:underline hover:prose-a:text-white/80
                    ">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>
                        }}
                      >
                        {message.content.replace(/\n(?!\n)/g, '\n\n')}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
          {/* Typing indicator */}
          {textChat.isProcessing && (
            <div className="flex justify-start">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl px-5 py-4">
                <div className="flex space-x-1.5">
                  <div className="w-2 h-2 rounded-full bg-white/60 animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 rounded-full bg-white/60 animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 rounded-full bg-white/60 animate-bounce"></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="flex-shrink-0 px-6 pb-6">
        <div className="max-w-4xl">
          <div className="relative">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={textChat.isProcessing ? `${agent.name} is typing...` : `Message ${agent.name}...`}
              className="w-full h-16 pr-16 text-base bg-white/95 backdrop-blur-sm border-0 text-foreground placeholder:text-muted-foreground rounded-3xl shadow-lg"
              disabled={textChat.isProcessing}
            />
            <Button
              onClick={handleSend}
              disabled={!inputValue.trim() || textChat.isProcessing}
              size="icon"
              className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-2xl bg-primary hover:bg-primary/90 shadow-md"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicChatInterface;
