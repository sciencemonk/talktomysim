import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";

const SUPABASE_URL = "https://uovhemqkztmkoozlmqxq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvdmhlbXFrenRta29vemxtcXhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3Mzc1NjQsImV4cCI6MjA3MTMxMzU2NH0.-7KqE9AROkWAskEnWESnLf9BEFiNGIE1b9s0uB8rdK4";
import { Button } from "@/components/ui/button";
import { StoreChatSidebar } from "@/components/StoreChatSidebar";
import { Package, ExternalLink, Store } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";
import { useStoreChatPersistence } from "@/hooks/useStoreChatPersistence";
import { AuthButton } from '@coinbase/cdp-react/components/AuthButton';
import { useIsSignedIn, useEvmAddress } from '@coinbase/cdp-hooks';
import { useAuth } from '@/hooks/useAuth';
import { userProfileService } from '@/services/userProfileService';

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
  const [chatOpen, setChatOpen] = useState(true);
  const [chatMessage, setChatMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const authButtonRef = useRef<HTMLDivElement>(null);
  const { isSignedIn } = useIsSignedIn();
  const { evmAddress } = useEvmAddress();
  const { updateUser } = useAuth();
  
  // Use persistent chat hook
  const { chatMessages, setChatMessages } = useStoreChatPersistence(username, store);

  // Handle Coinbase sign-in
  useEffect(() => {
    const handleSignIn = async () => {
      if (isSignedIn && evmAddress) {
        try {
          const existingProfile = await userProfileService.getProfileByWallet(evmAddress);
          const email = existingProfile?.email || `${evmAddress.slice(0, 8)}@wallet.local`;
          
          const profile = await userProfileService.upsertProfile(evmAddress, email);
          
          if (profile) {
            updateUser({
              id: profile.id,
              email: profile.email,
              address: evmAddress,
              coinbaseAuth: true,
              signedInAt: new Date().toISOString()
            });
            
            toast.success('Successfully signed in!');
            
            setTimeout(() => {
              navigate('/dashboard');
            }, 500);
          }
        } catch (error) {
          console.error('Error during sign-in:', error);
          toast.error('An error occurred during sign-in');
        }
      }
    };
    
    handleSignIn();
  }, [isSignedIn, evmAddress, navigate, updateUser]);

  const handleCreateStore = () => {
    // Trigger the AuthButton click
    const button = authButtonRef.current?.querySelector('button');
    if (button) {
      button.click();
    }
  };

  useEffect(() => {
    if (username) {
      loadStore();
    }
  }, [username]);

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
      // Filter out product-only messages (they have productId but no content)
      // and build conversation history with only text messages
      const conversationHistory = chatMessages
        .filter(msg => msg.content.trim() !== '' && !msg.productId)
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));

      conversationHistory.push({
        role: messageToSend.role,
        content: messageToSend.content
      });
      
      // Track which products have already been shown in this conversation
      const shownProductIds = chatMessages
        .filter(msg => msg.productId)
        .map(msg => msg.productId);

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
            products,
            shownProductIds
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
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 flex flex-col lg:flex-row">
      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${chatOpen ? 'lg:mr-96' : 'mr-0'}`}>
        {/* Compact Header */}
        <div className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 pr-24 lg:pr-6">
            <div className="flex items-center justify-between gap-4">
              {/* Store Info - Left Side */}
              <div className="flex flex-col gap-2 min-w-0 flex-1">
                <div className="flex-shrink-0">
                  {store.logo_url ? (
                    <img 
                      src={store.logo_url} 
                      alt={store.store_name}
                      className="w-12 h-12 object-contain"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-border/40">
                      <Store className="w-6 h-6 text-primary" />
                    </div>
                  )}
                </div>
                
                <div className="min-w-0">
                  {!store.logo_url && (
                    <h1 className="text-lg md:text-xl font-bold text-foreground truncate mb-1">
                      {store.store_name}
                    </h1>
                  )}
                  {store.store_description && (
                    <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                      {store.store_description}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Theme Toggle - Right Side */}
              <div className="flex-shrink-0">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-8 py-12">
          <div className="max-w-7xl mx-auto">
            {products.length > 0 && (
              <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                  {products.map((product) => (
                  <Card
                    key={product.id}
                    className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group border-border/50"
                    onClick={() => {
                      navigate(`/store/${username}/product/${product.id}`);
                    }}
                  >
                    {product.image_urls && product.image_urls.length > 0 && (
                      <div className="aspect-square overflow-hidden bg-muted">
                        <img
                          src={product.image_urls[0]}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <CardContent className="p-5">
                      <h3 className="font-semibold text-lg mb-2">{product.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{product.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold">${formatPrice(product.price)} {product.currency}</span>
                        <Button size="sm" variant="outline" className="hover:bg-primary hover:text-primary-foreground">View Details</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
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
          
          {/* Floating Create Store Button - Centered on Store Column */}
          <div className="fixed bottom-6 left-0 right-0 lg:right-96 flex justify-center z-40 pointer-events-none">
            <button
              onClick={handleCreateStore}
              className="pointer-events-auto inline-flex items-center gap-2 px-6 py-3 text-sm font-medium bg-white text-black rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 cursor-pointer"
            >
              Create your own Agentic Storefront
            </button>
          </div>
        </div>
      </div>

      {/* Chat Sidebar */}
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
        positioning="fixed"
      />

      {/* Hidden AuthButton for programmatic triggering */}
      <div ref={authButtonRef} className="hidden">
        <AuthButton onClick={() => localStorage.removeItem('explicit_signout')} />
      </div>
    </div>
  );
}
