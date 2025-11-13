import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Save } from "lucide-react";

type StoreEditModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  store: any;
  onUpdate: () => void;
};

export const StoreEditModal = ({ open, onOpenChange, store, onUpdate }: StoreEditModalProps) => {
  const [formData, setFormData] = useState({
    store_name: '',
    x_username: '',
    store_description: '',
    logo_url: ''
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (store) {
      setFormData({
        store_name: store.store_name || '',
        x_username: store.x_username || '',
        store_description: store.store_description || '',
        logo_url: store.logo_url || ''
      });
    }
  }, [store]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${store.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('store-avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('store-avatars')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, logo_url: publicUrl }));
      toast.success('Logo uploaded successfully');
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      const { error } = await supabase
        .from('stores')
        .update({
          store_name: formData.store_name,
          x_username: formData.x_username,
          store_description: formData.store_description,
          logo_url: formData.logo_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', store.id);

      if (error) throw error;
      toast.success('Store settings updated successfully');
      onUpdate();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating store settings:', error);
      toast.error('Failed to update store settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Store Settings</DialogTitle>
          <DialogDescription>
            Customize your store's appearance and behavior
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="design">Design</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4 mt-4">
              {/* Store Name */}
              <div className="space-y-2">
                <Label htmlFor="store_name">Store Name</Label>
                <Input
                  id="store_name"
                  value={formData.store_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, store_name: e.target.value }))}
                  placeholder="My Awesome Store"
                />
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="x_username">Store Username</Label>
                <Input
                  id="x_username"
                  value={formData.x_username}
                  onChange={(e) => setFormData(prev => ({ ...prev, x_username: e.target.value }))}
                  placeholder="mystore"
                />
                <p className="text-xs text-muted-foreground">
                  Your store will be accessible at: /store/{formData.x_username || 'username'}
                </p>
              </div>

              {/* Store Description */}
              <div className="space-y-2">
                <Label htmlFor="store_description">Store Description</Label>
                <Textarea
                  id="store_description"
                  value={formData.store_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, store_description: e.target.value }))}
                  placeholder="Describe what your store offers..."
                  rows={4}
                />
              </div>
            </TabsContent>

            <TabsContent value="design" className="space-y-4 mt-4">
              {/* Store Logo */}
              <div className="space-y-2">
                <Label htmlFor="logo">Store Logo</Label>
                <div className="flex items-center gap-4">
                  {formData.logo_url && (
                    <img
                      src={formData.logo_url}
                      alt="Store logo"
                      className="h-16 w-16 object-contain rounded border border-border"
                    />
                  )}
                  <div className="flex-1">
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={uploading}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {uploading ? 'Uploading...' : 'Upload a logo to replace your store name'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-border bg-muted/50">
                <h4 className="font-medium mb-2">Chat Widget Position</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Your store uses a floating chat widget positioned in the bottom right corner. This provides a familiar, non-intrusive shopping experience.
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span>Floating avatar chat widget</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span>Bottom right positioning</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span>Expandable chat window</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-border">
                <h4 className="font-medium mb-2">Coming Soon</h4>
                <p className="text-sm text-muted-foreground">
                  Additional customization options including colors, fonts, and layout themes will be available in a future update.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          {/* Actions */}
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
