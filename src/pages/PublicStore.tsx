import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductDetailModal } from "@/components/ProductDetailModal";
import { Package, ArrowLeft, ExternalLink } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "sonner";

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
  avatar_url?: string;
  crypto_wallet?: string;
  x_username: string;
  is_active: boolean;
};

export default function PublicStore() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productModalOpen, setProductModalOpen] = useState(false);

  useEffect(() => {
    if (username) {
      loadStore();
    }
  }, [username]);

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
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Top Navigation */}
      <div className="border-b border-border/40 bg-card/95 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 md:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-bold">Solana Internet Market</h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Store Content */}
      <div className="container mx-auto px-4 md:px-6 py-8 max-w-7xl">
        {/* Store Header */}
        <div className="text-center space-y-4 pb-8 mb-8 border-b border-border">
          <div className="flex justify-center">
            {store.avatar_url ? (
              <img
                src={store.avatar_url}
                alt={store.store_name}
                className="h-24 w-24 rounded-full border-4 border-primary object-cover"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center border-4 border-primary">
                <Package className="h-12 w-12 text-primary" />
              </div>
            )}
          </div>
          <div>
            <h1 className="text-4xl font-bold mb-2">{store.store_name}</h1>
            {store.store_description && (
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {store.store_description}
              </p>
            )}
          </div>
          <div className="flex items-center justify-center gap-2">
            <Badge variant="outline" className="gap-1">
              <ExternalLink className="h-3 w-3" />
              @{store.x_username}
            </Badge>
          </div>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
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
                    <h3 className="font-semibold mb-2 line-clamp-1">{product.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold">
                        ${product.price} {product.currency}
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
        ) : (
          <div className="text-center py-12">
            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No Products Yet</h3>
            <p className="text-muted-foreground">
              This store hasn't added any products yet. Check back soon!
            </p>
          </div>
        )}
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
    </div>
  );
}
