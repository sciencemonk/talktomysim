import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Code, DollarSign, TrendingUp, ShoppingBag, ExternalLink, Copy, Edit2, Check, ArrowUpRight, Package, Store as StoreIcon, Upload, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

type HomeDashboardTabProps = {
  store: any;
};

export const HomeDashboardTab = ({ store }: HomeDashboardTabProps) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditingRoute, setIsEditingRoute] = useState(false);
  const [newRoute, setNewRoute] = useState(store?.x_username || '');
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(true);
  
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

  const storeUrl = store?.x_username ? `https://simproject.org/store/${store.x_username}` : null;

  useEffect(() => {
    const loadRecentActivity = async () => {
      if (!store?.id) {
        setLoadingActivity(false);
        return;
      }

      try {
        setLoadingActivity(true);
        
        // Fetch recent orders
        const { data: orders } = await supabase
          .from('orders')
          .select('*, products(title)')
          .eq('store_id', store.id)
          .order('created_at', { ascending: false })
          .limit(5);

        // Fetch recent products
        const { data: products } = await supabase
          .from('products')
          .select('*')
          .eq('store_id', store.id)
          .order('created_at', { ascending: false })
          .limit(5);

        // Combine and sort by timestamp
        const activities = [
          ...(orders || []).map(order => ({
            type: 'order',
            id: order.id,
            title: `New order for ${order.products?.title || 'product'}`,
            amount: order.amount,
            status: order.status,
            timestamp: order.created_at
          })),
          ...(products || []).map(product => ({
            type: 'product',
            id: product.id,
            title: `Product added: ${product.title}`,
            timestamp: product.created_at
          }))
        ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
         .slice(0, 5);

        setRecentActivity(activities);
      } catch (error) {
        console.error('Error loading recent activity:', error);
      } finally {
        setLoadingActivity(false);
      }
    };

    loadRecentActivity();
  }, [store?.id]);

  const handleCopyUrl = () => {
    if (storeUrl) {
      navigator.clipboard.writeText(storeUrl);
      toast.success('Store URL copied to clipboard');
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingLogo(true);
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
    if (!store?.id) {
      toast.error('Store not found');
      return;
    }

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
      window.dispatchEvent(new CustomEvent('store-updated'));
    } catch (error) {
      console.error('Error updating store settings:', error);
      toast.error('Failed to update store settings');
    } finally {
      setSaving(false);
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
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Home</h2>
        <p className="text-muted-foreground">
          Manage your store settings and view recent activity
        </p>
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
                  <div className="flex flex-col gap-2">
                    <div className="px-2 py-2 bg-muted rounded-lg font-mono text-[10px] leading-tight break-all">
                      {storeUrl}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsEditingRoute(true)}
                        className="flex-1 sm:flex-none"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCopyUrl}
                        className="flex-1 sm:flex-none"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
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
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => {
                      const embedCode = `<script data-agent-url="${storeUrl}">
(function(){window.AgentEmbed={init:function(e){if(!e||!e.agentUrl)return console.error("AgentEmbed: agentUrl is required");const t=document.createElement("button");t.id="agent-embed-button",t.innerHTML='<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>',t.style.cssText="position:fixed;top:20px;right:20px;width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border:2px solid rgba(102,126,234,.3);cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.15);display:flex;align-items:center;justify-content:center;color:white;transition:transform .2s,box-shadow .2s;z-index:9998",t.addEventListener("mouseenter",function(){t.style.transform="scale(1.1)",t.style.boxShadow="0 6px 20px rgba(0,0,0,.2)"}),t.addEventListener("mouseleave",function(){t.style.transform="scale(1)",t.style.boxShadow="0 4px 12px rgba(0,0,0,.15)"});const n=document.createElement("div");n.id="agent-embed-sidebar",n.style.cssText="position:fixed;top:0;right:0;width:0;height:100vh;background:white;border-left:1px solid #e5e7eb;box-shadow:-4px 0 24px rgba(0,0,0,.1);overflow:hidden;transition:width .3s ease;z-index:9999;display:flex;flex-direction:column";const i=document.createElement("iframe");i.src=e.agentUrl,i.style.cssText="width:100%;height:100%;border:none",i.setAttribute("allow","microphone; camera"),n.appendChild(i);let o=!1;function s(){o=!0,t.style.display="none",window.innerWidth>1024?(n.style.width="384px",n.style.height="100vh",n.style.top="0",n.style.bottom="auto",n.style.left="auto",n.style.right="0",n.style.borderLeft="1px solid #e5e7eb",n.style.borderTop="none",n.style.transition="width .3s ease"):window.innerWidth>768?(n.style.width="320px",n.style.height="100vh",n.style.top="0",n.style.bottom="auto",n.style.left="auto",n.style.right="0",n.style.borderLeft="1px solid #e5e7eb",n.style.borderTop="none",n.style.transition="width .3s ease"):(n.style.width="100%",n.style.height="384px",n.style.top="auto",n.style.bottom="0",n.style.left="0",n.style.right="0",n.style.borderLeft="none",n.style.borderTop="1px solid #e5e7eb",n.style.transition="height .3s ease")}function d(){o=!1,t.style.display="flex",window.innerWidth<=768?n.style.height="0":n.style.width="0"}t.addEventListener("click",s),window.addEventListener("message",function(e){"closeAgentEmbed"===e.data&&d()}),window.addEventListener("resize",function(){o&&(window.innerWidth<=768?(n.style.width="100%",n.style.height="384px",n.style.top="auto",n.style.bottom="0",n.style.left="0",n.style.right="0",n.style.borderLeft="none",n.style.borderTop="1px solid #e5e7eb",n.style.transition="height .3s ease"):(n.style.width=window.innerWidth>1024?"384px":"320px",n.style.height="100vh",n.style.top="0",n.style.bottom="auto",n.style.left="auto",n.style.right="0",n.style.borderLeft="1px solid #e5e7eb",n.style.borderTop="none",n.style.transition="width .3s ease"))}),document.body.appendChild(t),document.body.appendChild(n),console.log("AgentEmbed: Initialized successfully")}},document.addEventListener("DOMContentLoaded",function(){const e=document.querySelector("script[data-agent-url]");if(e){const t=e.getAttribute("data-agent-url");window.AgentEmbed.init({agentUrl:t})}})})();
</script>`;
                      navigator.clipboard.writeText(embedCode);
                      toast.success('Embed code copied to clipboard');
                    }}
                    className="gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copy Embed Code
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Paste before the closing &lt;/body&gt; tag on your website
                  </p>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Configure your store username first to get the embed code
              </p>
            )}
          </CardContent>
        </Card>
      </div>

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
          {loadingActivity ? (
            <div className="text-center py-8">
              <div className="text-sm text-muted-foreground">Loading activity...</div>
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="text-center py-8 md:py-12">
              <div className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-muted mb-3 md:mb-4">
                <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-1 text-sm md:text-base">No activity yet</h3>
              <p className="text-xs md:text-sm text-muted-foreground">
                Your store activity will appear here once customers start interacting with your agent
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={`${activity.type}-${activity.id}`} className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                  <div className={`p-2 rounded-full ${activity.type === 'order' ? 'bg-primary/10' : 'bg-secondary/10'}`}>
                    {activity.type === 'order' ? (
                      <ShoppingBag className="h-4 w-4 text-primary" />
                    ) : (
                      <Package className="h-4 w-4 text-secondary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleDateString()} at {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {activity.type === 'order' && (
                        <>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className={`text-xs font-medium ${activity.status === 'completed' ? 'text-green-600' : 'text-amber-600'}`}>
                            {activity.status}
                          </span>
                          {activity.amount && (
                            <>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className="text-xs font-medium">${activity.amount}</span>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
