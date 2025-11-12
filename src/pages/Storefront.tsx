import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Store {
  id: string;
  x_username: string;
  x_display_name: string;
  x_profile_image: string;
  store_name: string;
  store_description: string;
  greeting_message: string;
  interaction_style: string;
  response_tone: string;
  primary_focus: string;
  crypto_wallet: string;
}

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  image_url?: string;
  delivery_info?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const Storefront = () => {
  const { username } = useParams();
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    if (username) {
      loadStore();
    }
  }, [username]);

  const loadStore = async () => {
    try {
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('*')
        .eq('x_username', username)
        .eq('is_active', true)
        .single();

      if (storeError) throw storeError;
      setStore(storeData);

      if (storeData.greeting_message) {
        setMessages([{
          role: 'assistant',
          content: storeData.greeting_message
        }]);
      }

      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', storeData.id)
        .eq('is_active', true);

      if (productsError) throw productsError;
      setProducts(productsData || []);
    } catch (error: any) {
      console.error('Error loading store:', error);
      toast.error('Store not found');
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !store) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Create AI response based on store configuration
      const systemPrompt = `You are an AI sales assistant for ${store.store_name}. 
      Store description: ${store.store_description}
      Interaction style: ${store.interaction_style}
      Response tone: ${store.response_tone}
      Primary focus: ${store.primary_focus}
      
      Available products: ${products.map(p => `${p.title} ($${p.price}) - ${p.description}`).join(', ')}
      
      Help customers discover products, answer questions, and guide them through the purchase process.`;

      // Simulate AI response (in production, call your AI endpoint)
      const assistantMessage: Message = {
        role: 'assistant',
        content: `Thanks for your message! I'd be happy to help you explore our products. You can browse the items below or ask me any questions about what we offer.`
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowPaymentModal(true);
  };

  const handlePayment = async () => {
    if (!selectedProduct || !store) return;

    try {
      // Initialize x402 payment
      toast.info('Initiating payment with x402...');
      
      // In production, you would:
      // 1. Create a payment session with x402
      // 2. Open x402 payment modal
      // 3. Handle payment confirmation
      // 4. Record order in database
      
      toast.success('Payment initiated! (x402 integration required)');
      setShowPaymentModal(false);
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error('Payment failed');
    }
  };

  if (!store) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading store...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Store Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            {store.x_profile_image && (
              <img
                src={store.x_profile_image}
                alt={store.x_display_name}
                className="w-16 h-16 rounded-full"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold text-foreground">{store.store_name}</h1>
              <p className="text-sm text-muted-foreground">@{store.x_username}</p>
              {store.store_description && (
                <p className="text-sm text-muted-foreground mt-1">{store.store_description}</p>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Chat Section */}
          <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col h-[600px]">
            <div className="p-4 border-b border-border">
              <h2 className="font-semibold text-foreground">Chat with AI Assistant</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-muted px-4 py-2 rounded-lg text-foreground">
                    Typing...
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} disabled={loading}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Products Section */}
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">Products</h2>
            <div className="space-y-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-card border border-border rounded-xl overflow-hidden"
                >
                  <div className="flex gap-4 p-4">
                    {product.image_url && (
                      <div className="w-24 h-24 flex-shrink-0 bg-muted rounded-lg overflow-hidden">
                        <img
                          src={product.image_url}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground mb-1">{product.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-foreground">
                          ${product.price} {product.currency}
                        </span>
                        <Button size="sm" onClick={() => handleBuyProduct(product)}>
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Buy Now
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {products.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No products available yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Purchase</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground">{selectedProduct.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedProduct.description}
                </p>
              </div>
              <div className="flex items-center justify-between py-3 border-t border-b border-border">
                <span className="text-muted-foreground">Price</span>
                <span className="text-lg font-bold text-foreground">
                  ${selectedProduct.price} {selectedProduct.currency}
                </span>
              </div>
              <div className="bg-muted/30 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Payment will be processed using x402 protocol. You'll be prompted to connect
                  your wallet and confirm the transaction.
                </p>
              </div>
              <div className="flex gap-3">
                <Button onClick={handlePayment} className="flex-1">
                  Pay with x402
                </Button>
                <Button variant="outline" onClick={() => setShowPaymentModal(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Storefront;
