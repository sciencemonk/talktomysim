import { useNavigate, useOutletContext } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Package, ExternalLink, Store } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
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
  agent_prompt?: string;
};

type OutletContext = {
  store: Store;
  products: Product[];
};

export default function PublicStore() {
  const navigate = useNavigate();
  const { store, products } = useOutletContext<OutletContext>();

  const handleViewProduct = (productId: string) => {
    navigate(productId);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {store.logo_url && (
              <img 
                src={store.logo_url} 
                alt={store.store_name}
                className="h-12 w-auto object-contain"
              />
            )}
            {store.x_username === 'sim' && (
              <span className="text-sm text-muted-foreground">Demo Store</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Store className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Products</h2>
          </div>
        </div>

        {products.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No products available at this time.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              const displayImage = product.image_urls && product.image_urls.length > 0
                ? product.image_urls[0]
                : product.image_url;

              return (
                <Card 
                  key={product.id} 
                  className="group cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                  onClick={() => handleViewProduct(product.id)}
                >
                  <CardContent className="p-0">
                    {displayImage ? (
                      <div className="relative h-48 overflow-hidden rounded-t-lg">
                        <img
                          src={displayImage}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      </div>
                    ) : (
                      <div className="h-48 bg-muted flex items-center justify-center">
                        <Package className="h-12 w-12 text-muted-foreground/50" />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-lg line-clamp-2 flex-1">{product.title}</h3>
                        <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{product.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-primary">
                          ${formatPrice(product.price)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
