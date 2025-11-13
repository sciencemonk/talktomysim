import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, ExternalLink, Package, Edit, X, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { StoreEditModal } from "./StoreEditModal";
import { ProductDetailModal } from "@/components/ProductDetailModal";

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

export const StorePreviewTab = ({ store, onUpdate }: StorePreviewTabProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(true); // Open by default
  const [chatMessage, setChatMessage] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productModalOpen, setProductModalOpen] = useState(false);

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
                    {product.image_url && (
                      <div className="aspect-square overflow-hidden bg-muted">
                        <img
                          src={product.image_url}
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
                          ${product.price} {product.currency}
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
        <div className="fixed bottom-6 right-6 z-50">
          {chatOpen ? (
            // Chat Window
            <Card className="w-[380px] h-[500px] shadow-2xl flex flex-col">
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
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-primary" />
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
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-0 flex flex-col">
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-lg p-3 max-w-[80%]">
                        <p className="text-sm">
                          {store?.greeting_message || 'Hello! How can I help you today?'}
                        </p>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
                <div className="p-4 border-t border-border">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          setChatMessage('');
                        }
                      }}
                    />
                    <Button size="icon" onClick={() => setChatMessage('')}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            // Chat Avatar Button
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
                <MessageSquare className="h-6 w-6" />
              )}
            </Button>
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

      {/* Product Detail Modal */}
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
    </div>
  );
};
