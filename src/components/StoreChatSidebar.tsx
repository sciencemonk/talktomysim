import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Bot, Send, ChevronRight, ChevronLeft } from "lucide-react";
import { ChatProductCard } from "@/components/ChatProductCard";

type ChatMessage = {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
  productId?: string;
};

type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  image_urls?: string[];
  is_active: boolean;
};

type StoreChatSidebarProps = {
  isOpen: boolean;
  onToggle: () => void;
  store: {
    store_name: string;
    avatar_url?: string;
  };
  chatMessages: ChatMessage[];
  chatMessage: string;
  setChatMessage: (msg: string) => void;
  handleSendMessage: () => void;
  isSending: boolean;
  products: Product[];
  onViewProduct: (productId: string) => void;
};

export const StoreChatSidebar = ({
  isOpen,
  onToggle,
  store,
  chatMessages,
  chatMessage,
  setChatMessage,
  handleSendMessage,
  isSending,
  products,
  onViewProduct
}: StoreChatSidebarProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isSending]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Toggle Button - Always Visible */}
      <Button
        onClick={onToggle}
        size="lg"
        className={`fixed top-1/2 -translate-y-1/2 h-16 rounded-l-full shadow-lg z-40 transition-all ${
          isOpen ? 'right-[400px]' : 'right-0'
        } w-12 p-0`}
      >
        {isOpen ? (
          <ChevronRight className="h-6 w-6" />
        ) : (
          <>
            {store.avatar_url ? (
              <img
                src={store.avatar_url}
                alt="Chat"
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <ChevronLeft className="h-6 w-6" />
            )}
          </>
        )}
      </Button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-[400px] bg-background border-l shadow-2xl z-30 transition-transform duration-300 flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b bg-background flex-shrink-0">
          <div className="flex items-center gap-3">
            {store.avatar_url ? (
              <div className="h-12 w-12 rounded-full border-2 border-primary overflow-hidden flex-shrink-0">
                <img
                  src={store.avatar_url}
                  alt="Agent"
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary flex-shrink-0">
                <Bot className="h-6 w-6 text-primary" />
              </div>
            )}
            <div>
              <h3 className="font-semibold">{store.store_name} AI</h3>
              <p className="text-xs text-muted-foreground">Online now</p>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.productId ? (
                  (() => {
                    const product = products.find(p => p.id === msg.productId);
                    return product ? (
                      <div className="max-w-[90%]">
                        <ChatProductCard
                          product={product}
                          onViewProduct={onViewProduct}
                        />
                      </div>
                    ) : null;
                  })()
                ) : (
                  <div
                    className={`rounded-lg p-3 max-w-[80%] break-words ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words overflow-wrap-anywhere">
                      {msg.content}
                    </p>
                  </div>
                )}
              </div>
            ))}
            {isSending && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex gap-1">
                    <div className="h-2 w-2 rounded-full bg-foreground/30 animate-bounce" />
                    <div className="h-2 w-2 rounded-full bg-foreground/30 animate-bounce [animation-delay:0.2s]" />
                    <div className="h-2 w-2 rounded-full bg-foreground/30 animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Chat Input */}
        <div className="p-4 border-t bg-background flex-shrink-0">
          <div className="flex gap-2">
            <Input
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about our products..."
              disabled={isSending}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!chatMessage.trim() || isSending}
              size="icon"
              className="flex-shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
