import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User, Home, Bot, Package, Store, LogOut, Menu } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { HomeDashboardTab } from "@/components/dashboard/HomeDashboardTab";
import { AgentPreviewTab } from "@/components/dashboard/AgentPreviewTab";
import { StoreCatalogTab } from "@/components/dashboard/StoreCatalogTab";
import { AgentSettingsTab } from "@/components/dashboard/AgentSettingsTab";
import { StorePreviewTab } from "@/components/dashboard/StorePreviewTab";
import { useEvmAddress } from "@coinbase/cdp-hooks";
import { cn } from "@/lib/utils";
import storeLogo from "@/assets/store-logo.gif";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { evmAddress } = useEvmAddress();
  const [activeView, setActiveView] = useState("home");
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

    // Listen for navigation events from Quick Actions
    const handleNavigation = (event: any) => {
      if (event.detail) {
        setActiveView(event.detail);
      }
    };
    window.addEventListener('navigate-dashboard', handleNavigation);

    return () => {
      window.removeEventListener('navigate-dashboard', handleNavigation);
    };
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
              <img 
                src={storeLogo} 
                alt="SIM" 
                className={cn(
                  "w-auto object-contain transition-all",
                  sidebarOpen ? "h-10" : "h-8"
                )}
              />
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
                activeView === "home" && "bg-accent",
                sidebarOpen ? "justify-start" : "justify-center"
              )}
              onClick={() => setActiveView("home")}
            >
              {activeView === "home" && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
              )}
              <Home className={cn("h-5 w-5 flex-shrink-0", activeView === "home" && "text-primary")} />
              {sidebarOpen && (
                <span className={cn("text-sm font-medium", activeView === "home" && "text-primary")}>
                  Home
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
                  Agent
                </span>
              )}
            </button>
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
              <Package className={cn("h-5 w-5 flex-shrink-0", activeView === "catalog" && "text-primary")} />
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
                activeView === "store" && "bg-accent",
                sidebarOpen ? "justify-start" : "justify-center"
              )}
              onClick={() => setActiveView("store")}
            >
              {activeView === "store" && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
              )}
              <Store className={cn("h-5 w-5 flex-shrink-0", activeView === "store" && "text-primary")} />
              {sidebarOpen && (
                <span className={cn("text-sm font-medium", activeView === "store" && "text-primary")}>
                  Store
                </span>
              )}
            </button>
          </nav>

          {/* User Section at Bottom */}
          <div className="p-2 border-t border-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                    "hover:bg-accent",
                    sidebarOpen ? "justify-start" : "justify-center"
                  )}
                >
                  <User className="h-5 w-5 flex-shrink-0" />
                  {sidebarOpen && (
                    <span className="text-sm font-medium truncate">
                      {user?.email || 'Account'}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="right" className="w-48">
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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
            <div className="flex items-center justify-end h-16">
              {/* Right side - Theme Toggle */}
              <ThemeToggle />
            </div>
          </div>
        </nav>

        {/* Page Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
          {/* Content Views */}
          <div className="space-y-6">
            {activeView === "home" && <HomeDashboardTab store={store} totalEarnings={totalEarnings} />}
            {activeView === "agent" && <AgentPreviewTab store={store} onUpdate={loadStore} />}
            {activeView === "catalog" && <StoreCatalogTab store={store} />}
            {activeView === "store" && <StorePreviewTab store={store} onUpdate={loadStore} />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
