import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Send, ChevronRight, ChevronLeft, Loader2, Bot } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { formatPrice } from '@/lib/utils';

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
  setChatMessage: (message: string) => void;
  handleSendMessage: () => void;
  isSending: boolean;
  products: Product[];
  onViewProduct?: (productId: string) => void;
  positioning?: 'fixed' | 'absolute'; // New prop
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
  onViewProduct,
  positioning = 'absolute'
}: StoreChatSidebarProps) => {
  const positionClass = positioning === 'fixed' ? 'fixed' : 'absolute';
  const zIndexClass = positioning === 'fixed' ? 'z-50' : '';
  
  return (
    <>
      {/* Toggle Button - Always visible */}
      <div className={`${positionClass} ${zIndexClass} top-4 transition-all duration-300 ${
        isOpen ? 'right-[400px]' : 'right-4'
      } group`}>
        <button
          onClick={onToggle}
          className={`shadow-lg rounded-full h-12 w-12 p-0 overflow-hidden border-2 border-primary bg-primary flex items-center justify-center transition-transform duration-200 ${
            !isOpen ? 'hover:scale-110' : ''
          }`}
        >
          <Bot className="h-6 w-6 text-primary-foreground" />
        </button>
        
        {/* Badge - Only visible when closed */}
        {!isOpen && (
          <div className="absolute -bottom-8 right-0 bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            Launch AI Agent
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div
        className={`${positionClass} ${zIndexClass} top-0 right-0 h-full bg-background border-l border-border transition-all duration-300 flex flex-col ${
          isOpen ? 'w-96' : 'w-0'
        } overflow-hidden`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">{store.store_name}</h3>
            <p className="text-xs text-muted-foreground">AI Shopping Assistant</p>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {chatMessages.map((message) => {
              if (message.productId) {
                const product = products.find(p => p.id === message.productId);
                if (product) {
                  return (
                    <Card key={message.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onViewProduct?.(product.id)}>
                      <CardContent className="p-3">
                        {product.image_urls && product.image_urls.length > 0 && (
                          <img
                            src={product.image_urls[0]}
                            alt={product.title}
                            className="w-full h-32 object-cover rounded mb-2"
                          />
                        )}
                        <h4 className="font-semibold text-sm mb-1">{product.title}</h4>
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{product.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold">${formatPrice(product.price)} {product.currency}</span>
                          <Button size="sm" variant="outline">View</Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                }
              }

              return (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              );
            })}
            {isSending && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-4 py-2 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <p className="text-sm text-muted-foreground">Thinking...</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Input
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask about products..."
              disabled={isSending}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!chatMessage.trim() || isSending}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
        </div>
      </div>
      </div>
    </>
  );
};
