import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Package, Edit, Trash2, Store, Upload, X, Save, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProductDialog } from "./ProductDialog";
import { ShopifyConnectModal } from "./ShopifyConnectModal";
import { formatPrice } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  image_urls?: string[];
  is_active: boolean;
  delivery_info?: string;
  checkout_fields?: {
    email: boolean;
    name: boolean;
    phone: boolean;
    address: boolean;
    wallet: boolean;
    sex: boolean;
    size: boolean;
    custom_fields: Array<{name: string; label: string; required: boolean}>;
  };
};

type StoreCatalogTabProps = {
  store: any;
};

export const StoreCatalogTab = ({ store }: StoreCatalogTabProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [shopifyModalOpen, setShopifyModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  
  // Store form data
  const [storeFormData, setStoreFormData] = useState({
    store_name: '',
    store_description: '',
    logo_url: ''
  });

  useEffect(() => {
    if (store) {
      setStoreFormData({
        store_name: store.store_name || '',
        store_description: store.store_description || '',
        logo_url: store.logo_url || ''
      });
    }
  }, [store]);

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
        delivery_info: p.delivery_info,
        checkout_fields: p.checkout_fields
      }));
      setProducts(products);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    if (!store?.crypto_wallet) {
      toast.error('Please add your Solana wallet address in the Earnings tab before creating products');
      return;
    }
    setEditingProduct(null);
    setDialogOpen(true);
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
    if (!store?.crypto_wallet) {
      toast.error('Please add your Solana wallet address in the Earnings tab before editing products');
      return;
    }
    setEditingProduct(product);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setDialogOpen(true);
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('File must be an image');
      return;
    }

    try {
      setUploadingLogo(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${store.user_id}/logo-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('store-logos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('store-logos')
        .getPublicUrl(filePath);

      setStoreFormData(prev => ({ ...prev, logo_url: publicUrl }));
      toast.success('Logo uploaded successfully');
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSaveStore = async () => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('stores')
        .update({
          store_name: storeFormData.store_name,
          store_description: storeFormData.store_description,
          logo_url: storeFormData.logo_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', store.id);

      if (error) throw error;
      toast.success('Store settings updated successfully');
      window.dispatchEvent(new Event('store-updated'));
    } catch (error) {
      console.error('Error updating store settings:', error);
      toast.error('Failed to update store settings');
    } finally {
      setSaving(false);
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Store</h2>
          <p className="text-muted-foreground">
            Configure your store and manage products
          </p>
        </div>
        <div className="flex gap-2">
          {store?.x_username && (
            <Button
              variant="outline"
              onClick={() => window.open(`/store/${store.x_username}`, '_blank')}
              className="gap-2"
            >
              View Live Store
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={() => setShopifyModalOpen(true)} 
            className="gap-2"
          >
            <Store className="h-4 w-4" />
            Connect Shopify
          </Button>
        </div>
      </div>

      {/* Store Settings */}
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label htmlFor="store_name">Store Name</Label>
            <Input
              id="store_name"
              value={storeFormData.store_name}
              onChange={(e) => setStoreFormData(prev => ({ ...prev, store_name: e.target.value }))}
              placeholder="Enter store name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="store_description">Store Description</Label>
            <Textarea
              id="store_description"
              value={storeFormData.store_description}
              onChange={(e) => setStoreFormData(prev => ({ ...prev, store_description: e.target.value }))}
              placeholder="Describe your store"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Store Logo</Label>
            <div className="flex items-center gap-4">
              {storeFormData.logo_url && (
                <img
                  src={storeFormData.logo_url}
                  alt="Store logo"
                  className="w-16 h-16 object-contain rounded border border-border"
                />
              )}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingLogo || !store?.id}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                </Button>
                {storeFormData.logo_url && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setStoreFormData(prev => ({ ...prev, logo_url: '' }))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
              />
            </div>
          </div>

          <Button
            onClick={handleSaveStore}
            disabled={saving || !store?.id}
            className="w-full"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Store Settings'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Products</CardTitle>
              <CardDescription>
                Manage your product inventory
              </CardDescription>
            </div>
            <Button onClick={handleAddProduct} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-12 px-4">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No products yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start by adding your first product or service
              </p>
              <Button onClick={handleAdd} className="gap-2 w-full sm:w-auto">
                <Plus className="h-4 w-4" />
                Add Your First Product
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-lg font-bold text-primary truncate">
                        ${formatPrice(product.price)} {product.currency}
                      </span>
                      <div className="flex gap-2 flex-shrink-0">
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
