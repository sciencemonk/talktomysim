import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Save } from "lucide-react";

type GeneralSettingsTabProps = {
  store: any;
  onUpdate: () => void;
};

export const GeneralSettingsTab = ({ store, onUpdate }: GeneralSettingsTabProps) => {
  const [formData, setFormData] = useState({
    store_name: '',
    store_description: '',
    x_username: '',
    x_display_name: '',
    crypto_wallet: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (store) {
      setFormData({
        store_name: store.store_name || '',
        store_description: store.store_description || '',
        x_username: store.x_username || '',
        x_display_name: store.x_display_name || '',
        crypto_wallet: store.crypto_wallet || ''
      });
    }
  }, [store]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.store_name) {
      toast.error('Store name is required');
      return;
    }

    try {
      setSaving(true);
      const { error } = await supabase
        .from('stores')
        .update({
          store_name: formData.store_name,
          store_description: formData.store_description,
          x_username: formData.x_username,
          x_display_name: formData.x_display_name,
          crypto_wallet: formData.crypto_wallet,
          updated_at: new Date().toISOString()
        })
        .eq('id', store.id);

      if (error) throw error;
      toast.success('Settings updated successfully');
      onUpdate();
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>General Settings</CardTitle>
        <CardDescription>
          Manage your store information and profile
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="store_name">Store Name *</Label>
            <Input
              id="store_name"
              value={formData.store_name}
              onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
              placeholder="My Awesome Store"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="store_description">Store Description</Label>
            <Textarea
              id="store_description"
              value={formData.store_description}
              onChange={(e) => setFormData({ ...formData, store_description: e.target.value })}
              placeholder="Tell customers about your store..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="x_username">X Username</Label>
              <Input
                id="x_username"
                value={formData.x_username}
                onChange={(e) => setFormData({ ...formData, x_username: e.target.value })}
                placeholder="@username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="x_display_name">X Display Name</Label>
              <Input
                id="x_display_name"
                value={formData.x_display_name}
                onChange={(e) => setFormData({ ...formData, x_display_name: e.target.value })}
                placeholder="Display Name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="crypto_wallet">Crypto Wallet Address</Label>
            <Input
              id="crypto_wallet"
              value={formData.crypto_wallet}
              onChange={(e) => setFormData({ ...formData, crypto_wallet: e.target.value })}
              placeholder="0x..."
            />
            <p className="text-sm text-muted-foreground">
              Where you'll receive payments from sales
            </p>
          </div>

          <Button type="submit" disabled={saving} className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
