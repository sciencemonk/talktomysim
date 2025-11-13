import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, ExternalLink, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  image_url?: string;
  is_active: boolean;
};

type StorePreviewTabProps = {
  store: any;
};

export const StorePreviewTab = ({ store }: StorePreviewTabProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

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
      setProducts(data || []);
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
            {store?.x_username && (
              <Button
                variant="outline"
                onClick={() => window.open(`/store/${store.x_username}`, '_blank')}
                className="gap-2"
              >
                View Live Store <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Store Preview Content */}
      <div className="border-2 border-dashed border-border rounded-lg p-8 bg-muted/20">
        {/* Store Header */}
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Store Info */}
          <div className="text-center space-y-4 pb-8 border-b border-border">
            {store?.x_profile_image && (
              <div className="flex justify-center">
                <img
                  src={store.x_profile_image}
                  alt={store.store_name}
                  className="h-24 w-24 rounded-full border-4 border-background shadow-lg"
                />
              </div>
            )}
            <div>
              <h1 className="text-4xl font-bold mb-2">{store?.store_name || 'My Store'}</h1>
              {store?.x_username && (
                <p className="text-muted-foreground">@{store.x_username}</p>
              )}
            </div>
            {store?.store_description && (
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {store.store_description}
              </p>
            )}
          </div>

          {/* AI Agent Card */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">Chat with our AI Assistant</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {store?.greeting_message || 'Hello! How can I help you today?'}
                  </p>
                  <Button className="gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Start Conversation
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Products Grid */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Our Products</h2>
              <Badge variant="secondary">
                {products.length} {products.length === 1 ? 'product' : 'products'}
              </Badge>
            </div>

            {products.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="p-12 text-center">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No products yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Add products in the Catalog tab to see them here
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    {product.image_url && (
                      <div className="aspect-video w-full overflow-hidden bg-muted">
                        <img
                          src={product.image_url}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">{product.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-primary">
                          {product.price} {product.currency}
                        </span>
                        <Button size="sm">View Details</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
