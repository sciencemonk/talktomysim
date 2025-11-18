import { useEffect, useState } from "react";
import { Outlet, useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { StoreFloatingChat } from "@/components/StoreFloatingChat";
import { useStoreChat } from "@/contexts/StoreChatContext";
import { useStoreChatPersistence } from "@/hooks/useStoreChatPersistence";
import { toast } from "sonner";

const SUPABASE_URL = "https://uovhemqkztmkoozlmqxq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvdmhlbXFrenRta29vemxtcXhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3Mzc1NjQsImV4cCI6MjA3MTMxMzU2NH0.-7KqE9AROkWAskEnWESnLf9BEFiNGIE1b9s0uB8rdK4";

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
  agent_prompt?: string;
};

type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  image_urls?: string[];
  is_active: boolean;
  store_id: string;
};

type ChatMessage = {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
  productId?: string;
};

export const StoreLayout = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatMessage, setChatMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { setCurrentStoreId } = useStoreChat();
  const { chatMessages, setChatMessages } = useStoreChatPersistence(username, store);

  useEffect(() => {
    if (username) {
      loadStoreData();
    }
  }, [username]);

  const loadStoreData = async () => {
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
        return;
      }

      setStore(storeData);
      setCurrentStoreId(storeData.id);

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
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    const messageToSend = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: chatMessage.trim(),
      timestamp: new Date()
    };

    if (!messageToSend.content.trim() || isSending || !store?.id) return;

    setChatMessages(prev => [...prev, messageToSend]);
    setChatMessage('');
    setIsSending(true);

    try {
      const conversationHistory = chatMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await fetch(`${SUPABASE_URL}/functions/v1/store-agent-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          message: messageToSend.content,
          storeId: store.id,
          conversationHistory
        })
      });

      if (!response.ok) throw new Error('Failed to send message');
      
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let assistantMessage = '';
      let currentMessageId = `agent-${Date.now()}`;
      let foundProductId: string | undefined;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.trim() || !line.startsWith('data: ')) continue;
          
          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            
            if (parsed.type === 'product') {
              foundProductId = parsed.productId;
            } else if (parsed.type === 'content') {
              assistantMessage += parsed.content;
              
              setChatMessages(prev => {
                const existing = prev.find(m => m.id === currentMessageId);
                if (existing) {
                  return prev.map(m => 
                    m.id === currentMessageId 
                      ? { ...m, content: assistantMessage, ...(foundProductId && { productId: foundProductId }) }
                      : m
                  );
                }
                return [...prev, {
                  id: currentMessageId,
                  role: 'agent' as const,
                  content: assistantMessage,
                  timestamp: new Date(),
                  ...(foundProductId && { productId: foundProductId })
                }];
              });
            }
          } catch (e) {
            console.error('Error parsing SSE data:', e);
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const handleViewProduct = (productId: string) => {
    navigate(`/store/${username}/${productId}`);
  };

  if (loading || !store) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading store...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex-1 overflow-auto">
        <Outlet context={{ store, products }} />
      </div>
      <StoreFloatingChat
        store={store}
        chatMessages={chatMessages}
        chatMessage={chatMessage}
        setChatMessage={setChatMessage}
        handleSendMessage={handleSendMessage}
        isSending={isSending}
        products={products}
        onViewProduct={handleViewProduct}
      />
    </div>
  );
};
