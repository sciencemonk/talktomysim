import { useRef, useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Send, Loader2, Bot, X, Mic, MicOff } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { formatPrice } from '@/lib/utils';
import OpenAIVoiceInterface from './OpenAIVoiceInterface';
import { useStoreChat } from '@/contexts/StoreChatContext';

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

type StoreFloatingChatProps = {
  store: {
    id: string;
    store_name: string;
    avatar_url?: string;
    agent_prompt?: string;
  };
  chatMessages: ChatMessage[];
  chatMessage: string;
  setChatMessage: (message: string) => void;
  handleSendMessage: () => void;
  isSending: boolean;
  products: Product[];
  onViewProduct?: (productId: string) => void;
};

export const StoreFloatingChat = ({
  store,
  chatMessages,
  chatMessage,
  setChatMessage,
  handleSendMessage,
  isSending,
  products,
  onViewProduct,
}: StoreFloatingChatProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { chatOpen, setChatOpen, isVoiceActive, setIsVoiceActive } = useStoreChat();
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isSending]);

  const handleAddMessage = (role: 'user' | 'agent', content: string, productId?: string) => {
    console.log('Voice message:', { role, content, productId });
  };

  const handleToggleMode = () => {
    if (isVoiceActive) {
      // Switching from voice to chat
      setIsVoiceActive(false);
      setChatOpen(true);
    } else {
      // Switching from chat to voice
      setChatOpen(false);
      setIsVoiceActive(true);
    }
  };
  
  return (
    <>
      {/* Floating Avatar Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {isVoiceActive && !chatOpen ? (
          <button
            onClick={handleToggleMode}
            className="flex gap-1 items-end h-12 bg-background/80 backdrop-blur-sm px-3 rounded-full border border-border shadow-lg hover:shadow-xl transition-all"
          >
            <div className="w-1.5 bg-primary rounded-full animate-[pulse_0.6s_ease-in-out_infinite]" style={{ height: '40%' }} />
            <div className="w-1.5 bg-primary rounded-full animate-[pulse_0.6s_ease-in-out_0.1s_infinite]" style={{ height: '80%' }} />
            <div className="w-1.5 bg-primary rounded-full animate-[pulse_0.6s_ease-in-out_0.2s_infinite]" style={{ height: '60%' }} />
            <div className="w-1.5 bg-primary rounded-full animate-[pulse_0.6s_ease-in-out_0.3s_infinite]" style={{ height: '100%' }} />
            <div className="w-1.5 bg-primary rounded-full animate-[pulse_0.6s_ease-in-out_0.2s_infinite]" style={{ height: '60%' }} />
            <div className="w-1.5 bg-primary rounded-full animate-[pulse_0.6s_ease-in-out_0.1s_infinite]" style={{ height: '80%' }} />
            <div className="w-1.5 bg-primary rounded-full animate-[pulse_0.6s_ease-in-out_infinite]" style={{ height: '40%' }} />
          </button>
        ) : chatOpen ? (
          <div className="bg-background border border-border rounded-2xl shadow-2xl w-[380px] h-[600px] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-primary">
                  {store.avatar_url ? (
                    <AvatarImage src={store.avatar_url} alt={store.store_name} />
                  ) : (
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot className="h-5 w-5" />
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <h3 className="font-semibold text-sm">{store.store_name}</h3>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setChatOpen(false);
                    setIsVoiceActive(true);
                  }}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {chatMessages.map((message) => (
                  <div key={message.id}>
                    <div className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {message.role === 'agent' && (
                        <Avatar className="h-8 w-8 border border-primary/20">
                          {store.avatar_url ? (
                            <AvatarImage src={store.avatar_url} alt={store.store_name} />
                          ) : (
                            <AvatarFallback className="bg-primary/10">
                              <Bot className="h-4 w-4" />
                            </AvatarFallback>
                          )}
                        </Avatar>
                      )}
                      
                      <div className={`max-w-[75%] ${message.role === 'user' ? 'order-first' : ''}`}>
                        <div className={`rounded-2xl px-4 py-2 ${
                          message.role === 'user' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        }`}>
                          <p className="text-sm leading-relaxed">{message.content}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Product Card */}
                    {message.productId && (
                      <div className="mt-2 ml-10">
                        {(() => {
                          const product = products.find(p => p.id === message.productId);
                          if (!product) return null;
                          return (
                            <Card 
                              className="cursor-pointer hover:shadow-md transition-shadow"
                              onClick={() => onViewProduct?.(product.id)}
                            >
                              <CardContent className="p-3">
                                <div className="flex gap-3">
                                  {product.image_urls && product.image_urls.length > 0 && (
                                    <img 
                                      src={product.image_urls[0]}
                                      alt={product.title}
                                      className="w-20 h-20 object-cover rounded-lg"
                                    />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-sm line-clamp-1">{product.title}</h4>
                                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{product.description}</p>
                                    <p className="text-sm font-bold text-primary mt-2">
                                      ${formatPrice(product.price)}
                                    </p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                ))}
                
                {isSending && (
                  <div className="flex gap-2 justify-start">
                    <Avatar className="h-8 w-8 border border-primary/20">
                      {store.avatar_url ? (
                        <AvatarImage src={store.avatar_url} alt={store.store_name} />
                      ) : (
                        <AvatarFallback className="bg-primary/10">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="bg-muted rounded-2xl px-4 py-2 flex items-center gap-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span className="text-sm text-muted-foreground">Thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t border-border bg-muted/30">
              <div className="flex gap-2">
                <Input
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !isSending && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1"
                  disabled={isSending}
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!chatMessage.trim() || isSending}
                  size="icon"
                  className="shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        {/* Voice Interface (always active when enabled) */}
        {isVoiceActive && (
          <OpenAIVoiceInterface
            storeId={store.id}
            onTranscript={handleAddMessage}
            onShowProduct={onViewProduct}
            autoStart={true}
            onSpeakingChange={setIsSpeaking}
          />
        )}
      </div>
    </>
  );
};
