import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Code, DollarSign, TrendingUp, ShoppingBag, ExternalLink, Copy, Edit2, Check, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

type HomeDashboardTabProps = {
  store: any;
  totalEarnings: number;
};

export const HomeDashboardTab = ({ store, totalEarnings }: HomeDashboardTabProps) => {
  const { user } = useAuth();
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
      window.location.reload();
    } catch (error) {
      console.error('Error updating route:', error);
      toast.error('Failed to update store route');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Welcome Header */}
      <div className="space-y-1">
        <h1 className="text-4xl font-bold tracking-tight">
          Welcome back
        </h1>
        <p className="text-lg text-muted-foreground">
          Here's what's happening with your store today
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Total Earnings Card */}
        <Card className="border-2">
          <CardHeader className="pb-3">
            <CardDescription className="text-sm font-medium">Total Earnings</CardDescription>
            <CardTitle className="text-4xl font-bold tabular-nums">
              ${totalEarnings.toFixed(2)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight className="h-4 w-4" />
                <span className="font-medium">0%</span>
              </div>
              <span className="text-muted-foreground">from last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Store Performance Card */}
        <Card className="border-2">
          <CardHeader className="pb-3">
            <CardDescription className="text-sm font-medium">Store Performance</CardDescription>
            <CardTitle className="text-4xl font-bold tabular-nums">
              0
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ShoppingBag className="h-4 w-4" />
              <span>Total orders processed</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Store Configuration */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Public Store URL */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Public Store URL</CardTitle>
            </div>
            <CardDescription>
              Share this link with customers to visit your store
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {storeUrl ? (
              <>
                {isEditingRoute ? (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
                      <span className="text-sm text-muted-foreground">/store/</span>
                      <Input
                        value={newRoute}
                        onChange={(e) => setNewRoute(e.target.value)}
                        className="h-8 border-0 bg-transparent p-0 focus-visible:ring-0"
                        disabled={saving}
                      />
                    </div>
                    <Button
                      size="sm"
                      onClick={handleUpdateRoute}
                      disabled={saving}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 px-3 py-2 bg-muted rounded-lg font-mono text-sm truncate">
                      {storeUrl}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsEditingRoute(true)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopyUrl}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <Button
                  variant="default"
                  className="w-full"
                  onClick={() => window.open(storeUrl, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Visit Store
                </Button>
              </>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Configure your store username to publish
              </p>
            )}
          </CardContent>
        </Card>

        {/* Embed Agent */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Code className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Embed on Your Website</CardTitle>
            </div>
            <CardDescription>
              Add your AI agent to any website with this embed code
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {storeUrl ? (
              <>
                <div className="relative">
                  <pre className="px-3 py-2 bg-muted rounded-lg text-xs overflow-x-auto max-h-32">
                    <code>{`<script src="${window.location.origin}/embed.js"></script>
<script>
  AgentEmbed.init({
    agentUrl: "${storeUrl}",
    position: "bottom-right"
  });
</script>`}</code>
                  </pre>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      const embedCode = `<script src="${window.location.origin}/embed.js"></script>\n<script>\n  AgentEmbed.init({\n    agentUrl: "${storeUrl}",\n    position: "bottom-right"\n  });\n</script>`;
                      navigator.clipboard.writeText(embedCode);
                      toast.success('Embed code copied to clipboard');
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Paste this code before the closing &lt;/body&gt; tag on your website
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Configure your store username first to get the embed code
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
          <CardDescription>
            Get started with these essential tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Button
              variant="outline"
              className="justify-start h-auto py-4 px-4"
              onClick={() => {
                const event = new CustomEvent('navigate-dashboard', { detail: 'agent' });
                window.dispatchEvent(event);
              }}
            >
              <div className="text-left">
                <div className="font-semibold">Configure Agent</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Customize your AI assistant
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="justify-start h-auto py-4 px-4"
              onClick={() => {
                const event = new CustomEvent('navigate-dashboard', { detail: 'catalog' });
                window.dispatchEvent(event);
              }}
            >
              <div className="text-left">
                <div className="font-semibold">Add Products</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Build your product catalog
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="justify-start h-auto py-4 px-4"
              onClick={() => {
                const event = new CustomEvent('navigate-dashboard', { detail: 'store' });
                window.dispatchEvent(event);
              }}
            >
              <div className="text-left">
                <div className="font-semibold">Preview Store</div>
                <div className="text-xs text-muted-foreground mt-1">
                  See how customers view your store
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </div>
          <CardDescription>
            Latest updates and interactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
              <TrendingUp className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-1">No activity yet</h3>
            <p className="text-sm text-muted-foreground">
              Your store activity will appear here once customers start interacting with your agent
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
