import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User, Home, Package, Store, LogOut, Menu, DollarSign, ShoppingBag } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { HomeDashboardTab } from "@/components/dashboard/HomeDashboardTab";
import { StoreCatalogTab } from "@/components/dashboard/StoreCatalogTab";
import { StorePreviewTab } from "@/components/dashboard/StorePreviewTab";
import { OrdersTab } from "@/components/dashboard/OrdersTab";
import Earnings from "./Earnings";
import { useEvmAddress, useSolanaAddress } from "@coinbase/cdp-hooks";
import { cn } from "@/lib/utils";
import storeLogo from "@/assets/store-logo.gif";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { evmAddress } = useEvmAddress();
  const { solanaAddress } = useSolanaAddress();
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

    // Check URL params for view
    const params = new URLSearchParams(location.search);
    const viewParam = params.get('view');
    if (viewParam) {
      setActiveView(viewParam);
    }

    // Listen for navigation events from Quick Actions
    const handleNavigation = (event: any) => {
      if (event.detail) {
        setActiveView(event.detail);
      }
    };
    
    // Listen for store updates
    const handleStoreUpdate = () => {
      loadStore();
    };
    
    window.addEventListener('navigate-dashboard', handleNavigation);
    window.addEventListener('store-updated', handleStoreUpdate);

    return () => {
      window.removeEventListener('navigate-dashboard', handleNavigation);
      window.removeEventListener('store-updated', handleStoreUpdate);
    };
  }, [user, navigate, location.search, solanaAddress]);

  const loadStore = async () => {
    try {
      setLoading(true);
      const { data: existingStore, error } = await supabase
        .from('stores')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching store:', error);
        throw error;
      }

      if (existingStore) {
        // Update the wallet address if it's changed or not set
        if (solanaAddress && existingStore.crypto_wallet !== solanaAddress) {
          const { error: updateError } = await supabase
            .from('stores')
            .update({ crypto_wallet: solanaAddress })
            .eq('id', existingStore.id);
          
          if (updateError) {
            console.error('Error updating wallet:', updateError);
          } else {
            existingStore.crypto_wallet = solanaAddress;
          }
        }
        setStore(existingStore);
      } else {
        // Create a default store for new users
        const defaultUsername = user.email?.split('@')[0]?.replace(/[^a-z0-9_-]/gi, '') || `user${Date.now()}`;
        
        console.log('Creating store with username:', defaultUsername);
        
        const { data: newStore, error: createError } = await supabase
          .from('stores')
          .insert({
            user_id: user.id,
            store_name: 'My Store',
            x_username: defaultUsername,
            store_description: 'Welcome to my store',
            interaction_style: 'Friendly and helpful',
            response_tone: 'Professional',
            primary_focus: 'Customer satisfaction',
            greeting_message: 'Hello! How can I help you today?',
            crypto_wallet: solanaAddress || null,
            is_active: true
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating store:', createError, {
            code: createError.code,
            message: createError.message,
            details: createError.details,
            hint: createError.hint
          });
          // Set store to null so user sees setup prompt
          setStore(null);
        } else {
          setStore(newStore);
          toast.success('Welcome! Your store has been created.');
        }
      }
    } catch (error) {
      console.error('Error loading store:', error, JSON.stringify(error, null, 2));
      toast.error('Failed to load store. Please try again.');
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
    <div className="min-h-screen bg-background flex flex-col md:flex-row overflow-x-hidden w-full">
      {/* Mobile Top Navigation */}
      <div className="md:hidden sticky top-0 z-50 bg-card border-b border-border w-full max-w-full">
        <div className="flex items-center justify-between p-3">
          <button onClick={() => navigate('/')} className="hover:opacity-80 transition-all flex-shrink-0">
            <img src={storeLogo} alt="SIM" className="h-8 w-auto object-contain" />
          </button>
          <div className="flex items-center gap-3 flex-shrink-0">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-popover border-border z-[100]">
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Mobile Navigation Dropdown */}
        <div className="border-t border-border w-full">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="w-full justify-between h-12 rounded-none px-4 text-base font-medium"
              >
                <span className="flex items-center gap-2 truncate">
                  {activeView === "home" && <><Home className="h-4 w-4 flex-shrink-0" /> Home</>}
                  {activeView === "store" && <><Store className="h-4 w-4 flex-shrink-0" /> Store</>}
                  {activeView === "catalog" && <><Package className="h-4 w-4 flex-shrink-0" /> Catalog</>}
                  {activeView === "orders" && <><ShoppingBag className="h-4 w-4 flex-shrink-0" /> Orders</>}
                  {activeView === "earnings" && <><DollarSign className="h-4 w-4 flex-shrink-0" /> Earnings</>}
                </span>
                <Menu className="h-4 w-4 flex-shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[calc(100vw-2rem)] bg-popover border-border z-[100]" align="start">
              <DropdownMenuItem 
                onClick={() => setActiveView("home")}
                className={cn("cursor-pointer py-3 text-foreground", activeView === "home" && "bg-accent")}
              >
                <Home className="mr-2 h-4 w-4" />
                Home
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setActiveView("store")}
                className={cn("cursor-pointer py-3 text-foreground", activeView === "store" && "bg-accent")}
              >
                <Store className="mr-2 h-4 w-4" />
                Store
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setActiveView("catalog")}
                className={cn("cursor-pointer py-3 text-foreground", activeView === "catalog" && "bg-accent")}
              >
                <Package className="mr-2 h-4 w-4" />
                Catalog
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setActiveView("orders")}
                className={cn("cursor-pointer py-3 text-foreground", activeView === "orders" && "bg-accent")}
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                Orders
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setActiveView("earnings")}
                className={cn("cursor-pointer py-3 text-foreground", activeView === "earnings" && "bg-accent")}
              >
                <DollarSign className="mr-2 h-4 w-4" />
                Earnings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden md:block fixed left-0 top-0 z-40 h-screen transition-all duration-300 bg-card border-r border-border overflow-hidden",
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
                activeView === "orders" && "bg-accent",
                sidebarOpen ? "justify-start" : "justify-center"
              )}
              onClick={() => setActiveView("orders")}
            >
              {activeView === "orders" && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
              )}
              <ShoppingBag className={cn("h-5 w-5 flex-shrink-0", activeView === "orders" && "text-primary")} />
              {sidebarOpen && (
                <span className={cn("text-sm font-medium", activeView === "orders" && "text-primary")}>
                  Orders
                </span>
              )}
            </button>
            <button
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all relative",
                "hover:bg-accent",
                activeView === "earnings" && "bg-accent",
                sidebarOpen ? "justify-start" : "justify-center"
              )}
              onClick={() => setActiveView("earnings")}
            >
              {activeView === "earnings" && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
              )}
              <DollarSign className={cn("h-5 w-5 flex-shrink-0", activeView === "earnings" && "text-primary")} />
              {sidebarOpen && (
                <span className={cn("text-sm font-medium", activeView === "earnings" && "text-primary")}>
                  Earnings
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
        "flex-1 flex flex-col min-h-screen transition-all duration-300 w-full",
        "md:ml-64 md:sidebarOpen:ml-64 md:sidebarClosed:ml-16",
        sidebarOpen ? "md:ml-64" : "md:ml-16"
      )}>
        {/* Desktop Top Navigation */}
        <nav className="hidden md:block border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-end h-16">
              {/* Right side - Theme Toggle */}
              <ThemeToggle />
            </div>
          </div>
        </nav>

        {/* Page Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-3 md:py-8 w-full max-w-full overflow-x-hidden overflow-y-auto">
          {/* Content Views */}
          <div className="space-y-6 w-full max-w-full">
            {activeView === "home" && <HomeDashboardTab store={store} totalEarnings={totalEarnings} />}
            {activeView === "store" && <StorePreviewTab store={store} onUpdate={loadStore} />}
            {activeView === "catalog" && <StoreCatalogTab store={store} />}
            {activeView === "orders" && <OrdersTab store={store} />}
            {activeView === "earnings" && <Earnings />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
