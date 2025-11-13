import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";

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

type ProductDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  storeId: string;
  onSuccess: () => void;
};

export const ProductDialog = ({ open, onOpenChange, product, storeId, onSuccess }: ProductDialogProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    currency: 'USDC',
    delivery_info: ''
  });
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title,
        description: product.description,
        price: product.price.toString(),
        currency: product.currency,
        delivery_info: product.delivery_info || ''
      });
      setImages(product.image_urls || []);
    } else {
      setFormData({
        title: '',
        description: '',
        price: '',
        currency: 'USDC',
        delivery_info: ''
      });
      setImages([]);
    }
  }, [product, open]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 4) {
      toast.error('You can only upload up to 4 images per product');
      return;
    }

    try {
      setUploading(true);
      const newImageUrls: string[] = [];

      for (const file of Array.from(files)) {
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large. Maximum size is 5MB`);
          continue;
        }

        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image file`);
          continue;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${storeId}/product-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);

        newImageUrls.push(publicUrl);
      }

      setImages(prev => [...prev, ...newImageUrls]);
      toast.success(`${newImageUrls.length} image(s) uploaded successfully`);
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      const productData = {
        store_id: storeId,
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        currency: formData.currency,
        image_urls: images,
        delivery_info: formData.delivery_info || null,
        is_active: true
      };

      if (product) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id);
        
        if (error) throw error;
        toast.success('Product updated successfully');
      } else {
        const { error } = await supabase
          .from('products')
          .insert(productData);
        
        if (error) throw error;
        toast.success('Product created successfully');
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Product' : 'Add Product'}</DialogTitle>
          <DialogDescription>
            {product ? 'Update your product details' : 'Add a new product or service to your catalog'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Product Images */}
            <div className="space-y-2">
              <Label>Product Images (up to 4)</Label>
              <div className="grid grid-cols-2 gap-3">
                {images.map((url, index) => (
                  <div key={index} className="relative group aspect-square rounded-lg border border-border overflow-hidden">
                    <img 
                      src={url} 
                      alt={`Product ${index + 1}`} 
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {images.length < 4 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary transition-colors flex flex-col items-center justify-center gap-2 bg-muted/50 hover:bg-muted"
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <span className="text-xs text-muted-foreground">Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-6 w-6 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Add Image</span>
                      </>
                    )}
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              <p className="text-xs text-muted-foreground">
                Upload up to 4 images. Max 5MB per image. Supported formats: JPG, PNG, WEBP
              </p>
            </div>

            {/* Product Name */}
            <div className="space-y-2">
              <Label htmlFor="title">Product Name *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Premium Consultation"
                required
              />
            </div>
            
            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your product or service..."
                rows={4}
                required
              />
            </div>

            {/* Price and Currency */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input
                  id="currency"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  placeholder="USDC"
                />
              </div>
            </div>

            {/* Delivery Info */}
            <div className="space-y-2">
              <Label htmlFor="delivery_info">Delivery Information</Label>
              <Textarea
                id="delivery_info"
                value={formData.delivery_info}
                onChange={(e) => setFormData({ ...formData, delivery_info: e.target.value })}
                placeholder="How will this product be delivered?"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || uploading}>
              {saving ? 'Saving...' : product ? 'Update Product' : 'Add Product'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
