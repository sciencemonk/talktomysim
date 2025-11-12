import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Edit, Trash2, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Store {
  id: string;
  x_username: string;
  store_name: string;
  store_description: string;
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
  is_active: boolean;
}

const StoreDashboard = () => {
  const navigate = useNavigate();
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    title: '',
    description: '',
    price: '',
    delivery_info: '',
    image_url: ''
  });

  useEffect(() => {
    loadStore();
  }, []);

  const loadStore = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/store/auth');
        return;
      }

      const { data: storeData, error } = await supabase
        .from('stores')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      if (!storeData) {
        navigate('/store/onboarding');
        return;
      }

      setStore(storeData);
      loadProducts(storeData.id);
    } catch (error: any) {
      console.error('Error loading store:', error);
      toast.error('Failed to load store');
    }
  };

  const loadProducts = async (storeId: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      console.error('Error loading products:', error);
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      title: '',
      description: '',
      price: '',
      delivery_info: '',
      image_url: ''
    });
    setShowProductModal(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      title: product.title,
      description: product.description,
      price: product.price.toString(),
      delivery_info: product.delivery_info || '',
      image_url: product.image_url || ''
    });
    setShowProductModal(true);
  };

  const handleSaveProduct = async () => {
    if (!store || !productForm.title || !productForm.price) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update({
            title: productForm.title,
            description: productForm.description,
            price: parseFloat(productForm.price),
            delivery_info: productForm.delivery_info,
            image_url: productForm.image_url
          })
          .eq('id', editingProduct.id);

        if (error) throw error;
        toast.success('Product updated!');
      } else {
        const { error } = await supabase
          .from('products')
          .insert({
            store_id: store.id,
            title: productForm.title,
            description: productForm.description,
            price: parseFloat(productForm.price),
            delivery_info: productForm.delivery_info,
            image_url: productForm.image_url
          });

        if (error) throw error;
        toast.success('Product added!');
      }

      setShowProductModal(false);
      loadProducts(store.id);
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast.error(error.message || 'Failed to save product');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      toast.success('Product deleted');
      loadProducts(store!.id);
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (!store) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{store.store_name}</h1>
              <p className="text-sm text-muted-foreground">@{store.x_username}</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => window.open(`/store/${store.x_username}`, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Store
              </Button>
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">Products</h2>
          <Button onClick={handleAddProduct}>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-card border border-border rounded-xl overflow-hidden">
              {product.image_url && (
                <div className="aspect-video bg-muted">
                  <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-semibold text-foreground mb-2">{product.title}</h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-foreground">${product.price} {product.currency}</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEditProduct(product)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDeleteProduct(product.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No products yet</p>
            <Button onClick={handleAddProduct}>Add Your First Product</Button>
          </div>
        )}
      </div>

      {/* Product Modal */}
      <Dialog open={showProductModal} onOpenChange={setShowProductModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input
                value={productForm.title}
                onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                placeholder="Product name"
                className="mt-2"
              />
            </div>
            <div>
              <Label>Description *</Label>
              <Textarea
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                placeholder="Describe your product"
                className="mt-2"
              />
            </div>
            <div>
              <Label>Price (USDC) *</Label>
              <Input
                type="number"
                step="0.01"
                value={productForm.price}
                onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                placeholder="0.00"
                className="mt-2"
              />
            </div>
            <div>
              <Label>Image URL</Label>
              <Input
                value={productForm.image_url}
                onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                placeholder="https://..."
                className="mt-2"
              />
            </div>
            <div>
              <Label>Delivery Information</Label>
              <Textarea
                value={productForm.delivery_info}
                onChange={(e) => setProductForm({ ...productForm, delivery_info: e.target.value })}
                placeholder="How will this be delivered?"
                className="mt-2"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button onClick={handleSaveProduct} className="flex-1">
                {editingProduct ? 'Update' : 'Add'} Product
              </Button>
              <Button variant="outline" onClick={() => setShowProductModal(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StoreDashboard;
