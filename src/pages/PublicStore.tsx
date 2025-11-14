import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProductDetailModal } from "@/components/ProductDetailModal";
import { Package, ExternalLink, MessageSquare, X, Send, Bot } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

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
};

export default function PublicStore() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (username) {
      loadStore();
    }
  }, [username]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isSending]);

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

      // Load store by username
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

      // Load products for this store
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
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvdmhlbXFrenRta29vemxtcXhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3Mzc1NjQsImV4cCI6MjA3MTMxMzU2NH0.-7KqE9AROkWAskEnWESnLf9BEFiNGIE1b9s0uB8rdK4`
          },
          body: JSON.stringify({
            storeId: store.id,
            messages: messagesToSend,
            products: products.map(p => ({
              id: p.id,
              title: p.title,
              description: p.description,
              price: p.price,
              currency: p.currency
            }))
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
      const agentMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: data.response,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, agentMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
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
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 pb-16">
      {/* Top Navigation - Only Theme Toggle */}
      <div className="border-b border-border/40 bg-card/95 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 md:px-6 py-3">
          <div className="flex items-center justify-end">
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Store Content */}
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Store Header */}
          <div className="text-center space-y-4 pb-8 mb-8 border-b border-border">
            <div className="flex justify-center">
              {store.logo_url ? (
                <img
                  src={store.logo_url}
                  alt={store.store_name}
                  className="h-24 object-contain"
                />
              ) : (
                <h1 className="text-4xl font-bold">{store.store_name}</h1>
              )}
            </div>
            {store.store_description && (
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
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
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
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={productModalOpen}
        onClose={() => {
          setProductModalOpen(false);
          setSelectedProduct(null);
        }}
        storeWalletAddress={store.crypto_wallet || ''}
        storeName={store.store_name}
      />

      {/* Footer Badge */}
      <footer className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
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

      {/* Floating Chat Button */}
      {!chatOpen && (
        <Button
          onClick={() => setChatOpen(true)}
          size="lg"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Window */}
      {chatOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl z-50 flex flex-col border-2">
          <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground">
            <div className="flex items-center gap-2">
              {store.avatar_url ? (
                <img
                  src={store.avatar_url}
                  alt="Agent"
                  className="h-10 w-10 rounded-full border-2 border-primary-foreground object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-primary-foreground/20 flex items-center justify-center border-2 border-primary-foreground">
                  <Bot className="h-5 w-5 text-primary-foreground" />
                </div>
              )}
              <div>
                <h3 className="font-semibold text-sm">{store.store_name} Assistant</h3>
                <p className="text-xs opacity-90">Online</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setChatOpen(false)}
              className="hover:bg-primary-foreground/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isSending && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-3">
                    <p className="text-sm text-muted-foreground">Typing...</p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="p-4 border-t bg-card">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex gap-2"
            >
              <Input
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Type your message..."
                disabled={isSending}
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={isSending || !chatMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>
      )}
    </div>
  );
}
