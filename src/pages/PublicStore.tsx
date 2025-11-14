import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";

const SUPABASE_URL = "https://uovhemqkztmkoozlmqxq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvdmhlbXFrenRta29vemxtcXhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3Mzc1NjQsImV4cCI6MjA3MTMxMzU2NH0.-7KqE9AROkWAskEnWESnLf9BEFiNGIE1b9s0uB8rdK4";
import { Button } from "@/components/ui/button";
import { ProductDetailModal } from "@/components/ProductDetailModal";
import { StoreChatSidebar } from "@/components/StoreChatSidebar";
import { Package, ExternalLink } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";

type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  image_url?: string;
  image_urls?: string[];
  is_active: boolean;
  store_id: string;
  delivery_info?: string;
};

type Store = {
  id: string;
  store_name: string;
  store_description?: string;
  logo_url?: string;
  avatar_url?: string;
  crypto_wallet?: string;
  x_username: string;
  is_active: boolean;
  greeting_message?: string;
};

type ChatMessage = {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
  productId?: string;
};

export default function PublicStore() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (username) {
      loadStore();
    }
  }, [username]);

  useEffect(() => {
    if (store?.greeting_message && chatMessages.length === 0 && chatOpen) {
      setChatMessages([{
        id: '1',
        role: 'agent',
        content: store.greeting_message,
        timestamp: new Date()
      }]);
    }
  }, [store?.greeting_message, chatOpen]);

  const loadStore = async () => {
    try {
      setLoading(true);

      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('*')
        .eq('x_username', username)
        .eq('is_active', true)
        .single();

      if (storeError) throw storeError;
      if (!storeData) {
        toast.error("Store not found");
        navigate('/');
        return;
      }

      setStore(storeData);

      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', storeData.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;
      const typedProducts = (productsData || []).map((p: any) => ({
        ...p,
        image_urls: Array.isArray(p.image_urls) ? p.image_urls : []
      }));
      setProducts(typedProducts);
    } catch (error) {
      console.error('Error loading store:', error);
      toast.error("Failed to load store");
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (purchaseMessage?: ChatMessage) => {
    const messageToSend = purchaseMessage || {
      id: Date.now().toString(),
      role: 'user' as const,
      content: chatMessage.trim(),
      timestamp: new Date()
    };

    if (!messageToSend.content.trim() || isSending || !store?.id) return;

    if (!purchaseMessage) {
      setChatMessages(prev => [...prev, messageToSend]);
      setChatMessage('');
    }
    
    setIsSending(true);

    try {
      const conversationHistory = chatMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      conversationHistory.push({
        role: messageToSend.role,
        content: messageToSend.content
      });

      const agentMessageId = `agent-${Date.now()}`;
      setChatMessages(prev => [...prev, {
        id: agentMessageId,
        role: 'agent',
        content: '',
        timestamp: new Date()
      }]);

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/store-agent-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({
            storeId: store.id,
            message: messageToSend.content,
            conversationHistory,
            products
          })
        }
      );

      if (!response.ok) throw new Error('Failed to get response');
      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';
      let buffer = '';
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

              const finishReason = parsed.choices?.[0]?.finish_reason;
              if (finishReason === 'tool_calls' && toolCalls.length > 0) {
                for (const toolCall of toolCalls) {
                  if (toolCall.function.name === 'show_product' && toolCall.function.arguments) {
                    try {
                      const args = JSON.parse(toolCall.function.arguments);
                      const productId = args.product_id;
                      
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
      toast.error('Failed to send message');
      setIsSending(false);
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading store...</p>
        </div>
      </div>
    );
  }

  if (!store) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 flex">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className={`flex-1 transition-all duration-300 ${chatOpen ? 'mr-[400px]' : 'mr-0'}`}>
        <div className="container mx-auto px-4 md:px-6 py-8 pt-16">
          <div className="max-w-6xl mx-auto">
            <div className="text-center space-y-4 pb-8 mb-8 border-b border-border">
              <div className="flex justify-center">
                {store.logo_url ? (
                  <img src={store.logo_url} alt={store.store_name} className="h-24 object-contain" />
                ) : (
                  <h1 className="text-4xl font-bold">{store.store_name}</h1>
                )}
              </div>
              {store.store_description && (
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{store.store_description}</p>
              )}
            </div>

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
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold">${formatPrice(product.price)} {product.currency}</span>
                          <Button size="sm" variant="outline">View Details</Button>
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
                <p className="text-sm text-muted-foreground">Check back soon!</p>
              </div>
            )}
          </div>
          
          <footer className="mt-16 mb-8 flex justify-center">
            <a
              href="https://simproject.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium bg-card/95 backdrop-blur-sm border border-border rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 text-muted-foreground hover:text-foreground"
            >
              <ExternalLink className="h-3 w-3" />
              Create your own Agentic Storefront
            </a>
          </footer>
        </div>
      </div>
      
      <ProductDetailModal
        product={selectedProduct}
        isOpen={productModalOpen}
        onClose={() => {
          setProductModalOpen(false);
          setSelectedProduct(null);
        }}
        storeWalletAddress={store.crypto_wallet || ''}
        storeName={store.store_name}
        onPurchaseSuccess={(productTitle) => {
          const purchaseMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: `I just purchased: ${productTitle}`,
            timestamp: new Date()
          };
          setChatMessages(prev => [...prev, purchaseMessage]);
          handleSendMessage(purchaseMessage);
        }}
      />

      <StoreChatSidebar
        isOpen={chatOpen}
        onToggle={() => setChatOpen(!chatOpen)}
        store={{
          store_name: store.store_name,
          avatar_url: store.avatar_url
        }}
        chatMessages={chatMessages}
        chatMessage={chatMessage}
        setChatMessage={setChatMessage}
        handleSendMessage={() => handleSendMessage()}
        isSending={isSending}
        products={products}
        onViewProduct={(productId) => {
          const product = products.find(p => p.id === productId);
          if (product) {
            setSelectedProduct(product);
            setProductModalOpen(true);
          }
        }}
      />
    </div>
  );
}
