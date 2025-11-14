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
    if (!newRoute.trim()) {
      toast.error('Please enter a store username');
      return;
    }

    if (newRoute === store?.x_username) {
      setIsEditingRoute(false);
      return;
    }

    try {
      setSaving(true);
      
      // If no store exists yet, create one first
      if (!store) {
        console.log('Creating new store with username:', newRoute.trim());
        
        const { data: newStore, error: createError } = await supabase
          .from('stores')
          .insert({
            user_id: user.id,
            store_name: 'My Store',
            x_username: newRoute.trim(),
            store_description: 'Welcome to my store',
            interaction_style: 'Friendly and helpful',
            response_tone: 'Professional',
            primary_focus: 'Customer satisfaction',
            greeting_message: 'Hello! How can I help you today?',
            is_active: true
          })
          .select()
          .single();

        if (createError) {
          console.error('Store creation error:', createError, {
            code: createError.code,
            message: createError.message,
            details: createError.details,
            hint: createError.hint
          });
          
          if (createError.code === '23505') {
            toast.error('This username is already taken. Please choose another.');
          } else {
            toast.error(`Failed to create store: ${createError.message}`);
          }
          return;
        }
        
        toast.success('Store created successfully!');
        setIsEditingRoute(false);
        // Dispatch event to reload store data without full page refresh
        window.dispatchEvent(new CustomEvent('store-updated'));
        return;
      }

      // Otherwise update existing store
      console.log('Updating store username to:', newRoute.trim());
      
      const { error } = await supabase
        .from('stores')
        .update({ x_username: newRoute.trim() })
        .eq('id', store.id);

      if (error) {
        console.error('Store update error:', error);
        if (error.code === '23505') {
          toast.error('This username is already taken. Please choose another.');
        } else {
          toast.error(`Failed to update username: ${error.message}`);
        }
        return;
      }
      
      toast.success('Store username updated successfully');
      setIsEditingRoute(false);
      // Dispatch event to reload store data without full page refresh
      window.dispatchEvent(new CustomEvent('store-updated'));
    } catch (error: any) {
      console.error('Error in handleUpdateRoute:', error);
      toast.error(`An error occurred: ${error?.message || 'Please try again'}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-8 pb-8">
      {/* Welcome Header */}
      <div className="space-y-1">
        <h1 className="text-2xl md:text-4xl font-bold tracking-tight">
          Welcome back
        </h1>
        <p className="text-sm md:text-lg text-muted-foreground">
          Here's what's happening with your store today
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-3 md:gap-6 md:grid-cols-2">
        {/* Total Earnings Card */}
        <Card className="border-2">
          <CardHeader className="pb-2 md:pb-3">
            <CardDescription className="text-xs md:text-sm font-medium">Total Earnings</CardDescription>
            <CardTitle className="text-2xl md:text-4xl font-bold tabular-nums">
              ${totalEarnings % 1 === 0 ? totalEarnings : totalEarnings.toFixed(2)}
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
          <CardHeader className="pb-2 md:pb-3">
            <CardDescription className="text-xs md:text-sm font-medium">Store Performance</CardDescription>
            <CardTitle className="text-2xl md:text-4xl font-bold tabular-nums">
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
      <div className="grid gap-3 md:gap-6 md:grid-cols-2">
        {/* Public Store URL */}
        <Card>
          <CardHeader className="pb-3 md:pb-4">
            <div className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              <CardTitle className="text-base md:text-lg">Public Store URL</CardTitle>
            </div>
            <CardDescription className="text-xs md:text-sm">
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
              <div className="py-6 space-y-4">
                <div className="text-center space-y-2">
                  <h3 className="font-semibold text-foreground">Welcome! Let's set up your store</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose a unique username for your store URL
                  </p>
                </div>
                <div className="space-y-3">
                  <Input
                    placeholder="your-store-name"
                    value={newRoute}
                    onChange={(e) => setNewRoute(e.target.value)}
                    className="text-center"
                  />
                  <Button
                    onClick={handleUpdateRoute}
                    disabled={!newRoute.trim() || saving}
                    className="w-full"
                  >
                    {saving ? 'Setting up...' : 'Create Store URL'}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Your store will be at: {window.location.origin}/store/{newRoute || 'username'}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Embed Agent */}
        <Card>
          <CardHeader className="pb-3 md:pb-4">
            <div className="flex items-center gap-2">
              <Code className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              <CardTitle className="text-base md:text-lg">Embed on Your Website</CardTitle>
            </div>
            <CardDescription className="text-xs md:text-sm">
              Add your AI agent to any website with this embed code
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {storeUrl ? (
              <>
                <div className="relative">
                  <pre className="px-2 py-1.5 md:px-3 md:py-2 bg-muted rounded-lg text-xs overflow-x-auto max-h-24 md:max-h-32">
                    <code>{`<script src="https://simproject.org/embed.js"></script>
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
                      const embedCode = `<script src="https://simproject.org/embed.js"></script>\n<script>\n  AgentEmbed.init({\n    agentUrl: "${storeUrl}",\n    position: "bottom-right"\n  });\n</script>`;
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
        <CardHeader className="pb-3 md:pb-4">
          <CardTitle className="text-base md:text-lg">Quick Actions</CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Get started with these essential tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Button
              variant="outline"
              className="justify-start h-auto py-3 md:py-4 px-3 md:px-4"
              onClick={() => {
                const event = new CustomEvent('navigate-dashboard', { detail: 'agent' });
                window.dispatchEvent(event);
              }}
            >
              <div className="text-left">
                <div className="font-semibold text-sm">Configure Agent</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Customize your AI assistant
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="justify-start h-auto py-3 md:py-4 px-3 md:px-4"
              onClick={() => {
                const event = new CustomEvent('navigate-dashboard', { detail: 'catalog' });
                window.dispatchEvent(event);
              }}
            >
              <div className="text-left">
                <div className="font-semibold text-sm">Add Products</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Build your product catalog
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="justify-start h-auto py-3 md:py-4 px-3 md:px-4"
              onClick={() => {
                const event = new CustomEvent('navigate-dashboard', { detail: 'store' });
                window.dispatchEvent(event);
              }}
            >
              <div className="text-left">
                <div className="font-semibold text-sm">Preview Store</div>
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
        <CardHeader className="pb-3 md:pb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            <CardTitle className="text-base md:text-lg">Recent Activity</CardTitle>
          </div>
          <CardDescription className="text-xs md:text-sm">
            Latest updates and interactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 md:py-12">
            <div className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-muted mb-3 md:mb-4">
              <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-1 text-sm md:text-base">No activity yet</h3>
            <p className="text-xs md:text-sm text-muted-foreground">
              Your store activity will appear here once customers start interacting with your agent
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
