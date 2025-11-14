import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, ExternalLink, Package, Edit, X, Send, Bot } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { StoreEditModal } from "./StoreEditModal";
import { AgentEditModal } from "./AgentEditModal";
import { ProductDetailModal } from "@/components/ProductDetailModal";
import { ChatProductCard } from "@/components/ChatProductCard";
import { formatPrice } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  image_url?: string;
  is_active: boolean;
  store_id: string;
  image_urls?: string[];
  delivery_info?: string;
};

type StorePreviewTabProps = {
  store: any;
  onUpdate: () => void;
};

type ChatMessage = {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
  productId?: string; // For product card messages
};

export const StorePreviewTab = ({ store, onUpdate }: StorePreviewTabProps) => {
  const isMobile = useIsMobile();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [agentEditModalOpen, setAgentEditModalOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isSending]);

  // Initialize chat with greeting message
  useEffect(() => {
    if (store?.greeting_message && chatMessages.length === 0) {
      setChatMessages([{
        id: '1',
        role: 'agent',
        content: store.greeting_message,
        timestamp: new Date()
      }]);
    }
  }, [store?.greeting_message]);

  useEffect(() => {
    if (store?.id) {
      loadProducts();
    } else {
      setLoading(false);
    }
  }, [store?.id]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', store.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      const typedProducts = (data || []).map((p: any) => ({
        ...p,
        image_urls: Array.isArray(p.image_urls) ? p.image_urls : []
      }));
      setProducts(typedProducts);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || isSending || !store?.id) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: chatMessage.trim(),
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatMessage('');
    setIsSending(true);

    try {
      // Prepare conversation history for AI
      const messagesToSend = [...chatMessages, userMessage].map(msg => ({
        role: msg.role === 'agent' ? 'assistant' : msg.role,
        content: msg.content
      }));

      const response = await fetch(
        `https://uovhemqkztmkoozlmqxq.supabase.co/functions/v1/store-agent-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvdmhlbXFrenRta29vemxtcXhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3Mzc1NjQsImV4cCI6MjA3MTMxMzU2NH0.-7KqE9AROkWAskEnWESnLf9BEFiNGIE1b9s0uB8rdK4`,
          },
          body: JSON.stringify({
            messages: messagesToSend,
            storeId: store.id
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to get response');
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      // Create placeholder for streaming message
      const agentMessageId = (Date.now() + 1).toString();
      setChatMessages(prev => [...prev, {
        id: agentMessageId,
        role: 'agent',
        content: '',
        timestamp: new Date()
      }]);

      // Stream the response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullContent = '';
      let toolCalls: any[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              const delta_tool_calls = parsed.choices?.[0]?.delta?.tool_calls;
              
              if (content) {
                fullContent += content;
                setChatMessages(prev => prev.map(msg => 
                  msg.id === agentMessageId 
                    ? { ...msg, content: fullContent }
                    : msg
                ));
              }

              // Handle tool calls - display product cards immediately
              if (delta_tool_calls) {
                for (const toolCall of delta_tool_calls) {
                  const index = toolCall.index;
                  if (!toolCalls[index]) {
                    toolCalls[index] = {
                      id: toolCall.id,
                      type: toolCall.type,
                      function: {
                        name: toolCall.function?.name || '',
                        arguments: toolCall.function?.arguments || ''
                      }
                    };
                  } else {
                    if (toolCall.function?.arguments) {
                      toolCalls[index].function.arguments += toolCall.function.arguments;
                    }
                  }
                }
              }

              // Check for completed tool calls with finish_reason
              const finishReason = parsed.choices?.[0]?.finish_reason;
              if (finishReason === 'tool_calls' && toolCalls.length > 0) {
                // Process and display tool calls immediately
                for (const toolCall of toolCalls) {
                  if (toolCall.function.name === 'show_product' && toolCall.function.arguments) {
                    try {
                      const args = JSON.parse(toolCall.function.arguments);
                      const productId = args.product_id;
                      
                      // Add product card message immediately
                      setChatMessages(prev => [...prev, {
                        id: `product-${Date.now()}-${Math.random()}`,
                        role: 'agent',
                        content: '',
                        productId: productId,
                        timestamp: new Date()
                      }]);
                    } catch (e) {
                      console.error('Error processing tool call:', e);
                    }
                  }
                }
                // Clear tool calls after processing
                toolCalls = [];
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      setIsSending(false);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsSending(false);
      // Optionally show error message to user
      setChatMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading preview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Preview Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Store Preview</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                This is how customers will see your store
              </p>
            </div>
            <div className="flex gap-2">
              {store?.x_username && (
                <Button
                  variant="outline"
                  onClick={() => window.open(`/store/${store.x_username}`, '_blank')}
                  className="gap-2"
                >
                  View Live Store <ExternalLink className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setEditModalOpen(true)}
                className="gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit Store
              </Button>
              <Button
                variant="outline"
                onClick={() => setAgentEditModalOpen(true)}
                className="gap-2"
              >
                <Bot className="h-4 w-4" />
                Edit Agent
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Store Preview Content - Updated Layout */}
      <div className="relative border-2 border-dashed border-border rounded-lg p-8 bg-muted/20 min-h-[600px]">
        {/* Store Header */}
        <div className="max-w-6xl mx-auto">
          {/* Store Info */}
          <div className="text-center space-y-4 pb-8 mb-8 border-b border-border">
            {/* Show Logo or Store Name */}
            <div className="flex justify-center">
              {store?.logo_url ? (
                <img
                  src={store.logo_url}
                  alt={store.store_name}
                  className="h-24 object-contain"
                />
              ) : (
                <h1 className="text-4xl font-bold">{store?.store_name || 'Store Name'}</h1>
              )}
            </div>
            {store?.store_description && (
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {store.store_description}
              </p>
            )}
          </div>

          {/* Products Grid */}
          {products.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Products</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <Card 
                    key={product.id} 
                    className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                    onClick={() => {
                      setSelectedProduct(product);
                      setProductModalOpen(true);
                    }}
                  >
                    {product.image_urls && product.image_urls.length > 0 && (
                      <div className="aspect-square overflow-hidden bg-muted">
                        <img
                          src={product.image_urls[0]}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">{product.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold">
                          ${formatPrice(product.price)} {product.currency}
                        </span>
                        <Badge variant={product.is_active ? "default" : "secondary"}>
                          {product.is_active ? 'Available' : 'Inactive'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {products.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No products yet</p>
              <p className="text-sm text-muted-foreground">Add products in the Catalog tab</p>
            </div>
          )}
        </div>

        {/* Floating Chat Widget - Bottom Right */}
        <div className={`fixed z-[100] ${
          isMobile 
            ? 'inset-0' 
            : 'bottom-6 right-6'
        }`}>
          {chatOpen ? (
            // Chat Window
            <Card className={`shadow-2xl flex flex-col bg-background ${
              isMobile 
                ? 'w-full h-full rounded-none border-0' 
                : 'w-[380px] h-[500px] rounded-lg'
            }`}>
              <CardHeader className="border-b border-border flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {store?.avatar_url ? (
                      <img
                        src={store.avatar_url}
                        alt="Agent"
                        className="h-10 w-10 rounded-full border-2 border-primary object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary">
                        <Bot className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold">{store?.store_name || 'Store'} AI</h3>
                      <p className="text-xs text-muted-foreground">Online now</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setChatOpen(false)}
                    className="z-[110]"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
                <ScrollArea className={`flex-1 p-4 ${
                  isMobile ? 'h-[calc(100vh-140px)]' : 'h-[calc(500px-140px)]'
                }`}>
                  <div className="space-y-4">
                    {chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {msg.productId ? (
                          // Product card message
                          (() => {
                            const product = products.find(p => p.id === msg.productId);
                            return product ? (
                              <div 
                                className="max-w-[90%]"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ChatProductCard
                                  product={product}
                                  onViewProduct={(productId) => {
                                    const product = products.find(p => p.id === productId);
                                    if (product) {
                                      setSelectedProduct(product);
                                      setProductModalOpen(true);
                                    }
                                  }}
                                />
                              </div>
                            ) : null;
                          })()
                        ) : (
                          // Regular text message
                          <div
                            className={`rounded-lg p-3 max-w-[80%] break-words ${
                              msg.role === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words overflow-wrap-anywhere">{msg.content}</p>
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
                  </div>
                  <div ref={messagesEndRef} />
                </ScrollArea>
                <div className="p-4 border-t border-border">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      disabled={isSending}
                    />
                    <Button 
                      size="icon" 
                      onClick={handleSendMessage}
                      disabled={!chatMessage.trim() || isSending}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            !isMobile && (
              // Chat Avatar Button - Only show on desktop
              <Button
                size="icon"
                className="h-14 w-14 rounded-full shadow-2xl"
                onClick={() => setChatOpen(true)}
              >
                {store?.avatar_url ? (
                  <img
                    src={store.avatar_url}
                    alt="Chat"
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <Bot className="h-6 w-6" />
                )}
              </Button>
            )
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <StoreEditModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        store={store}
        onUpdate={onUpdate}
      />

      {/* Agent Edit Modal */}
      <AgentEditModal
        open={agentEditModalOpen}
        onOpenChange={setAgentEditModalOpen}
        store={store}
        onUpdate={onUpdate}
      />

      {/* Product Detail Modal */}
      {productModalOpen && (
        <ProductDetailModal
          product={selectedProduct}
          isOpen={productModalOpen}
          onClose={() => {
            setProductModalOpen(false);
            setSelectedProduct(null);
          }}
          storeWalletAddress={store?.crypto_wallet || ''}
          storeName={store?.store_name || 'Store'}
        />
      )}
    </div>
  );
};
