import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Package, DollarSign, Info, ExternalLink } from "lucide-react";
import { X402PaymentModal } from "@/components/X402PaymentModal";
import { ShareButton } from "@/components/ShareButton";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";

const SUPABASE_URL = "https://uovhemqkztmkoozlmqxq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvdmhlbXFrenRta29vemxtcXhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3Mzc1NjQsImV4cCI6MjA3MTMxMzU2NH0.-7KqE9AROkWAskEnWESnLf9BEFiNGIE1b9s0uB8rdK4";

type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  image_urls?: string[];
  is_active: boolean;
  delivery_info?: string;
  store_id: string;
  checkout_fields?: {
    email?: boolean;
    name?: boolean;
    phone?: boolean;
    address?: boolean;
    wallet?: boolean;
  };
};

type Store = {
  id: string;
  store_name: string;
  crypto_wallet?: string;
  x_username: string;
  store_description?: string;
  logo_url?: string;
  avatar_url?: string;
  greeting_message?: string;
  agent_prompt?: string;
};

export default function ProductDetail() {
  const { username, productId } = useParams<{ username: string; productId: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (username && productId) {
      loadProductAndStore();
    }
  }, [username, productId]);

  const loadProductAndStore = async () => {
    try {
      setLoading(true);

      // First get the store
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

      // Then get the product
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .eq('store_id', storeData.id)
        .eq('is_active', true)
        .single();

      if (productError) throw productError;
      if (!productData) {
        toast.error("Product not found");
        navigate(`/store/${username}`);
        return;
      }

      const typedProduct: Product = {
        id: productData.id,
        title: productData.title,
        description: productData.description,
        price: productData.price,
        currency: productData.currency,
        is_active: productData.is_active,
        delivery_info: productData.delivery_info,
        store_id: productData.store_id,
        checkout_fields: typeof productData.checkout_fields === 'object' && productData.checkout_fields !== null
          ? productData.checkout_fields as Product['checkout_fields']
          : undefined,
        image_urls: Array.isArray(productData.image_urls) 
          ? productData.image_urls.filter((url): url is string => typeof url === 'string')
          : []
      };
      setProduct(typedProduct);
    } catch (error) {
      console.error('Error loading product:', error);
      toast.error("Failed to load product");
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = () => {
    if (!store?.crypto_wallet) {
      toast.error("The store owner has not added a SOL wallet to their account. Purchases are currently unavailable.");
      return;
    }
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = (sessionId: string) => {
    console.log("Payment successful:", sessionId);
    setShowPaymentModal(false);
    toast.success("Purchase successful!");
    navigate(`/store/${username}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product || !store) {
    return null;
  }

  const images = product.image_urls || [];
  const productUrl = `${window.location.origin}/store/${username}/product/${productId}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 relative">
      <div className="flex-1">
        <div className="container mx-auto px-4 md:px-6 py-8">
        {/* Back Button and Share */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(`/store/${username}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Store
          </Button>
          <ShareButton 
            url={productUrl}
            title={product.title}
            description={product.description}
          />
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Product Images */}
            <div className="space-y-4">
              {images.length > 0 ? (
                <>
                  <div className="aspect-square overflow-hidden rounded-lg bg-muted border">
                    <img
                      src={images[selectedImageIndex]}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedImageIndex(idx)}
                          className={`aspect-square overflow-hidden rounded-md border-2 transition-all ${
                            selectedImageIndex === idx ? 'border-primary' : 'border-transparent'
                          }`}
                        >
                          <img
                            src={img}
                            alt={`${product.title} ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="aspect-square overflow-hidden rounded-lg bg-muted border flex items-center justify-center">
                  <Package className="h-24 w-24 text-muted-foreground opacity-50" />
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <h1 className="text-3xl font-bold">{product.title}</h1>
                  <Badge variant={product.is_active ? "default" : "secondary"}>
                    {product.is_active ? 'Available' : 'Inactive'}
                  </Badge>
                </div>
                <p className="text-2xl font-bold text-primary">
                  ${formatPrice(product.price)} {product.currency}
                </p>
              </div>

              <div className="prose prose-sm max-w-none">
                <p className="text-muted-foreground whitespace-pre-wrap">{product.description}</p>
              </div>

              {product.delivery_info && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold mb-1">Delivery Information</h3>
                        <p className="text-sm text-muted-foreground">{product.delivery_info}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handlePurchase}
                  size="lg"
                  className="flex-1"
                  disabled={!product.is_active || store.x_username === 'sim'}
                >
                  <DollarSign className="h-5 w-5 mr-2" />
                  {store.x_username === 'sim' ? 'Demo Product' : 'Purchase Now'}
                </Button>
              </div>

              <div className="text-xs text-muted-foreground">
                <p>{store.x_username === 'sim' ? 'This is a demo store. Checkout is disabled.' : 'Secure checkout powered by Solana blockchain'}</p>
              </div>
            </div>
          </div>
        </div>
        </div>

        <footer className="mt-16 mb-8 flex justify-center">
          <a
            href="https://simproject.org"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium bg-card/95 backdrop-blur-sm border border-border rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="h-4 w-4" />
            Create your own Agentic Storefront
          </a>
        </footer>
      </div>

      {showPaymentModal && product && store && (
        <X402PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onPaymentSuccess={handlePaymentSuccess}
          simName={store.store_name}
          price={product.price}
          walletAddress={store.crypto_wallet || ''}
          product={{
            id: product.id,
            title: product.title,
            description: product.description,
            delivery_info: product.delivery_info,
            checkout_fields: product.checkout_fields,
          }}
          storeId={store.id}
        />
      )}

    </div>
  );
}
