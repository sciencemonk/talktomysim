import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User, Store, Bot, Eye, LogOut, Wallet, DollarSign, ExternalLink, Menu } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { StoreCatalogTab } from "@/components/dashboard/StoreCatalogTab";
import { AgentSettingsTab } from "@/components/dashboard/AgentSettingsTab";
import { StorePreviewTab } from "@/components/dashboard/StorePreviewTab";
import { useEvmAddress } from "@coinbase/cdp-hooks";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { evmAddress } = useEvmAddress();
  const [activeView, setActiveView] = useState("catalog");
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    loadStore();
  }, [user, navigate]);

  const loadStore = async () => {
    try {
      setLoading(true);
      const { data: existingStore, error } = await supabase
        .from('stores')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (existingStore) {
        setStore(existingStore);
      } else {
        // Create a default store for new users
        const { data: newStore, error: createError } = await supabase
          .from('stores')
          .insert({
            user_id: user.id,
            store_name: 'My Store',
            x_username: user.email?.split('@')[0] || 'user',
            store_description: 'Welcome to my store',
            interaction_style: 'Friendly and helpful',
            response_tone: 'Professional',
            primary_focus: 'Customer satisfaction',
            greeting_message: 'Hello! How can I help you today?'
          })
          .select()
          .single();

        if (createError) throw createError;
        setStore(newStore);
        toast.success('Store created successfully!');
      }
    } catch (error) {
      console.error('Error loading store:', error);
      toast.error('Failed to load store');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 z-40 h-screen transition-all duration-300 bg-card border-r border-border overflow-hidden",
        sidebarOpen ? "w-64" : "w-16"
      )}>
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className={cn(
            "p-3 border-b border-border flex items-center justify-between gap-2 relative group"
          )}>
            <button 
              onClick={() => !sidebarOpen ? setSidebarOpen(true) : navigate('/')} 
              className={cn(
                "hover:opacity-80 transition-all flex-shrink-0 relative",
                !sidebarOpen && "mx-auto group-hover:opacity-0"
              )}
            >
              <div className="bg-black/90 rounded-lg px-1.5 py-0.5">
                <img 
                  src="/sim-logo-white.png" 
                  alt="SIM" 
                  className={cn(
                    "w-auto object-contain transition-all",
                    sidebarOpen ? "h-5" : "h-4"
                  )}
                />
              </div>
            </button>
            
            {/* Toggle button - shows on open (right side) or on hover when closed (center) */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={cn(
                "flex-shrink-0 h-8 w-8 p-0 transition-all",
                sidebarOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100 absolute inset-0 m-auto"
              )}
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 p-2 space-y-1">
            <button
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all relative",
                "hover:bg-accent",
                activeView === "catalog" && "bg-accent",
                sidebarOpen ? "justify-start" : "justify-center"
              )}
              onClick={() => setActiveView("catalog")}
            >
              {activeView === "catalog" && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
              )}
              <Store className={cn("h-5 w-5 flex-shrink-0", activeView === "catalog" && "text-primary")} />
              {sidebarOpen && (
                <span className={cn("text-sm font-medium", activeView === "catalog" && "text-primary")}>
                  Catalog
                </span>
              )}
            </button>
            <button
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all relative",
                "hover:bg-accent",
                activeView === "agent" && "bg-accent",
                sidebarOpen ? "justify-start" : "justify-center"
              )}
              onClick={() => setActiveView("agent")}
            >
              {activeView === "agent" && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
              )}
              <Bot className={cn("h-5 w-5 flex-shrink-0", activeView === "agent" && "text-primary")} />
              {sidebarOpen && (
                <span className={cn("text-sm font-medium", activeView === "agent" && "text-primary")}>
                  Agent Settings
                </span>
              )}
            </button>
            <button
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all relative",
                "hover:bg-accent",
                activeView === "preview" && "bg-accent",
                sidebarOpen ? "justify-start" : "justify-center"
              )}
              onClick={() => setActiveView("preview")}
            >
              {activeView === "preview" && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
              )}
              <Eye className={cn("h-5 w-5 flex-shrink-0", activeView === "preview" && "text-primary")} />
              {sidebarOpen && (
                <span className={cn("text-sm font-medium", activeView === "preview" && "text-primary")}>
                  Store Preview
                </span>
              )}
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className={cn(
        "flex-1 flex flex-col min-h-screen transition-all duration-300",
        sidebarOpen ? "ml-64" : "ml-16"
      )}>
        {/* Top Navigation */}
        <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Menu toggle for collapsed state */}
              {!sidebarOpen && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(true)}
                  className="gap-2"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              )}
              
              {/* Spacer when sidebar is open */}
              {sidebarOpen && <div />}
              
              {/* Right side - Theme Toggle + User dropdown */}
              <div className="flex items-center gap-4 ml-auto">
                <ThemeToggle />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="gap-2"
                    >
                      <User className="h-4 w-4" />
                      {user?.email || 'Account'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </nav>

        {/* Page Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Agentic Sales Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage your store, products, and AI agent settings
            </p>
          </div>

          {/* Store Stats */}
          <div className="grid gap-4 md:grid-cols-3 mb-8">
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
                    <Store className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">Public Store</p>
                    {store?.x_username ? (
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-primary"
                        onClick={() => window.open(`/store/${store.x_username}`, '_blank')}
                      >
                        View Store <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    ) : (
                      <p className="text-sm text-muted-foreground">Not published</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content Views */}
          <div className="space-y-6">
            {activeView === "catalog" && <StoreCatalogTab store={store} />}
            {activeView === "agent" && <AgentSettingsTab store={store} onUpdate={loadStore} />}
            {activeView === "preview" && <StorePreviewTab store={store} />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
