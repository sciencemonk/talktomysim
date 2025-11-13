import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Package, Edit, Trash2, Store } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProductDialog } from "./ProductDialog";
import { ShopifyConnectModal } from "./ShopifyConnectModal";
import { formatPrice } from "@/lib/utils";

type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  image_urls?: string[];
  is_active: boolean;
  delivery_info?: string;
};

type StoreCatalogTabProps = {
  store: any;
};

export const StoreCatalogTab = ({ store }: StoreCatalogTabProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [shopifyModalOpen, setShopifyModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

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
        .order('created_at', { ascending: false });

      if (error) throw error;
      // Cast the data to match our Product type with image_urls
      // Note: TypeScript types haven't been regenerated after migration, so we cast through any
      const products = (data || []).map((p: any) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        price: p.price,
        currency: p.currency,
        image_urls: (p.image_urls as string[]) || [],
        is_active: p.is_active,
        delivery_info: p.delivery_info
      }));
      setProducts(products);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      toast.success('Product deleted successfully');
      loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Product Catalog</CardTitle>
              <CardDescription>
                Add and manage products and services for your AI agent to sell
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShopifyModalOpen(true)} className="gap-2">
                <Store className="h-4 w-4" />
                Connect Shopify
              </Button>
              <Button onClick={handleAdd} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No products yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start by adding your first product or service
              </p>
              <Button onClick={handleAdd} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Your First Product
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  {product.image_urls && product.image_urls.length > 0 && (
                    <div className="aspect-video w-full overflow-hidden bg-muted">
                      <img 
                        src={product.image_urls[0]} 
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2 line-clamp-1">{product.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">
                        ${formatPrice(product.price)} {product.currency}
                      </span>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEdit(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ProductDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={editingProduct}
        storeId={store?.id}
        onSuccess={loadProducts}
      />
      
      <ShopifyConnectModal
        open={shopifyModalOpen}
        onOpenChange={setShopifyModalOpen}
        storeId={store?.id}
        onSuccess={loadProducts}
      />
    </div>
  );
};
