import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, DollarSign, Store as StoreIcon, TrendingUp, Users, Package, ExternalLink, Copy, Edit2 } from "lucide-react";
import { useEvmAddress } from "@coinbase/cdp-hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type HomeDashboardTabProps = {
  store: any;
  totalEarnings: number;
};

export const HomeDashboardTab = ({ store, totalEarnings }: HomeDashboardTabProps) => {
  const { evmAddress } = useEvmAddress();
  const [isEditingRoute, setIsEditingRoute] = useState(false);
  const [newRoute, setNewRoute] = useState(store?.x_username || '');
  const [saving, setSaving] = useState(false);

  const storeUrl = store?.x_username ? `${window.location.origin}/store/${store.x_username}` : null;

  const handleCopyUrl = () => {
    if (storeUrl) {
      navigator.clipboard.writeText(storeUrl);
      toast.success('Store URL copied to clipboard');
    }
  };

  const handleUpdateRoute = async () => {
    if (!newRoute.trim() || newRoute === store?.x_username) {
      setIsEditingRoute(false);
      return;
    }

    try {
      setSaving(true);
      const { error } = await supabase
        .from('stores')
        .update({ x_username: newRoute.trim() })
        .eq('id', store.id);

      if (error) throw error;
      toast.success('Store route updated successfully');
      setIsEditingRoute(false);
      window.location.reload(); // Reload to reflect changes
    } catch (error) {
      console.error('Error updating route:', error);
      toast.error('Failed to update store route');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome back!
        </h1>
        <p className="text-muted-foreground">
          Here's an overview of your store's performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground mb-1">Wallet Address</p>
                <p className="text-sm font-mono truncate">
                  {evmAddress ? `${evmAddress.slice(0, 6)}...${evmAddress.slice(-4)}` : 'Not connected'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Earnings</p>
                <p className="text-2xl font-bold">${totalEarnings.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <StoreIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Store Status</p>
                <p className="text-sm font-medium">
                  {store?.x_username ? 'Published' : 'Not published'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-1">
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <ExternalLink className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Public Store</p>
                  {storeUrl ? (
                    <div className="flex items-center gap-2">
                      {isEditingRoute ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={newRoute}
                            onChange={(e) => setNewRoute(e.target.value)}
                            className="h-7 text-xs max-w-[150px]"
                            disabled={saving}
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleUpdateRoute}
                            disabled={saving}
                            className="h-7 px-2"
                          >
                            Save
                          </Button>
                        </div>
                      ) : (
                        <>
                          <a
                            href={storeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-mono text-primary hover:underline truncate max-w-[200px]"
                          >
                            /{store.x_username}
                          </a>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setIsEditingRoute(true)}
                            className="h-6 w-6 p-0"
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleCopyUrl}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Not published</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm">Store created</span>
                </div>
                <span className="text-xs text-muted-foreground">Today</span>
              </div>
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No customer interactions yet</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Products</span>
                <span className="text-lg font-bold">0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active Conversations</span>
                <span className="text-lg font-bold">0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Sales</span>
                <span className="text-lg font-bold">$0.00</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started */}
      {!store?.x_username && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold">1</span>
                </div>
                <div>
                  <p className="font-medium">Set up your AI agent</p>
                  <p className="text-sm text-muted-foreground">Configure personality and behavior</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold">2</span>
                </div>
                <div>
                  <p className="font-medium">Add your first product</p>
                  <p className="text-sm text-muted-foreground">Build your catalog</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold">3</span>
                </div>
                <div>
                  <p className="font-medium">Publish your store</p>
                  <p className="text-sm text-muted-foreground">Share with customers</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
