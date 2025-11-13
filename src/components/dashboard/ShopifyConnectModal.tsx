import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Store } from "lucide-react";

type ShopifyConnectModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storeId: string;
  onSuccess: () => void;
};

export const ShopifyConnectModal = ({ open, onOpenChange, storeId, onSuccess }: ShopifyConnectModalProps) => {
  const [shopDomain, setShopDomain] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [syncing, setSyncing] = useState(false);

  const handleConnect = async () => {
    if (!shopDomain || !accessToken) {
      toast.error("Please enter both shop domain and access token");
      return;
    }

    try {
      setSyncing(true);

      // Update store with Shopify credentials
      const { error: updateError } = await supabase
        .from('stores')
        .update({
          shopify_store_url: shopDomain,
          shopify_access_token: accessToken
        })
        .eq('id', storeId);

      if (updateError) throw updateError;

      // Call edge function to sync products
      const { data, error: syncError } = await supabase.functions.invoke('sync-shopify-products', {
        body: { storeId }
      });

      if (syncError) throw syncError;

      toast.success(`Successfully synced ${data.synced} products from Shopify`);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error connecting to Shopify:', error);
      toast.error('Failed to connect to Shopify');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Connect to Shopify
          </DialogTitle>
          <DialogDescription>
            Connect your Shopify store to automatically sync your product catalog
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="shop-domain">Shop Domain</Label>
            <Input
              id="shop-domain"
              placeholder="mystore.myshopify.com"
              value={shopDomain}
              onChange={(e) => setShopDomain(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Your Shopify store domain (e.g., mystore.myshopify.com)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="access-token">Admin API Access Token</Label>
            <Input
              id="access-token"
              type="password"
              placeholder="shpat_..."
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Create an access token in your Shopify admin under Settings → Apps and sales channels → Develop apps
            </p>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Required API Scopes:</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• read_products</li>
              <li>• read_product_listings</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={syncing}>
            Cancel
          </Button>
          <Button onClick={handleConnect} disabled={syncing}>
            {syncing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Syncing Products...
              </>
            ) : (
              'Connect & Sync'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
