import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Store, Bot, Settings, LogOut } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { StoreCatalogTab } from "@/components/dashboard/StoreCatalogTab";
import { AgentSettingsTab } from "@/components/dashboard/AgentSettingsTab";
import { GeneralSettingsTab } from "@/components/dashboard/GeneralSettingsTab";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("catalog");
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
        .single();

      if (error && error.code !== 'PGRST116') {
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
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button onClick={() => navigate('/')} className="flex items-center hover:opacity-80 transition-opacity">
              <div className="bg-black/90 rounded-lg px-2 py-1">
                <img src="/sim-logo-white.png" alt="SIM" className="h-6 w-auto" />
              </div>
            </button>
            
            {/* Right side - User dropdown + Theme Toggle */}
            <div className="flex items-center gap-4">
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Agentic Sales Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage your store, products, and AI agent settings
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
            <TabsTrigger value="catalog" className="gap-2">
              <Store className="h-4 w-4" />
              Store/Catalog
            </TabsTrigger>
            <TabsTrigger value="agent" className="gap-2">
              <Bot className="h-4 w-4" />
              Agent Settings
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              General Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="catalog" className="space-y-6">
            <StoreCatalogTab store={store} />
          </TabsContent>

          <TabsContent value="agent" className="space-y-6">
            <AgentSettingsTab store={store} onUpdate={loadStore} />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <GeneralSettingsTab store={store} onUpdate={loadStore} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
