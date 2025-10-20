import { useEffect, useState } from "react";
import { Loader2, Menu, Plug, Calendar, CheckCircle2, XCircle, Hexagon, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Integrations = () => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    checkGoogleCalendarConnection();
    
    // Handle OAuth callback
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    
    if (code && state) {
      handleOAuthCallback(code, state);
    }
  }, []);

  const checkGoogleCalendarConnection = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_integrations')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('integration_type', 'google_calendar')
        .single();

      setIsConnected(!!data && !error);
    } catch (error) {
      console.error('Error checking integration:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthCallback = async (code: string, userToken: string) => {
    setConnecting(true);
    try {
      const redirectUri = `${window.location.origin}/integrations`;
      
      const { data, error } = await supabase.functions.invoke('google-oauth-callback', {
        body: { code, userToken, redirectUri }
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Google Calendar connected successfully",
      });
      
      setIsConnected(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
      console.error('OAuth callback error:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect Google Calendar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setConnecting(false);
    }
  };

  const connectGoogleCalendar = async () => {
    setConnecting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to connect integrations",
          variant: "destructive",
        });
        return;
      }

      const redirectUri = `${window.location.origin}/integrations`;

      const { data, error } = await supabase.functions.invoke('google-oauth', {
        body: { userToken: session.access_token, redirectUri }
      });

      if (error) throw error;

      window.location.href = data.authUrl;
    } catch (error) {
      console.error('Error connecting:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to initiate Google Calendar connection",
        variant: "destructive",
      });
      setConnecting(false);
    }
  };

  const disconnectGoogleCalendar = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from('user_integrations')
        .delete()
        .eq('user_id', session.user.id)
        .eq('integration_type', 'google_calendar');

      if (error) throw error;

      setIsConnected(false);
      toast({
        title: "Disconnected",
        description: "Google Calendar has been disconnected",
      });
    } catch (error) {
      console.error('Error disconnecting:', error);
      toast({
        title: "Error",
        description: "Failed to disconnect Google Calendar",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex-1 min-h-screen overflow-auto bg-background">
      {/* Mobile Header with Menu */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b">
          <div className="flex items-center justify-between p-3">
            <SidebarTrigger className="h-10 w-10">
              <Menu className="h-5 w-5" />
            </SidebarTrigger>
            <img 
              src="/sim-logo.png" 
              alt="Sim Logo" 
              className="h-8 w-8 object-contain"
            />
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </div>
      )}
      
      <div className={`h-full max-w-7xl mx-auto p-8 ${isMobile ? 'pt-[73px]' : ''}`}>
        <div className="space-y-8">
          {/* Header with gradient */}
          <div className="space-y-4">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-2">
              <Plug className="h-4 w-4 mr-2" />
              Connected Services
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Integrations
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Connect your Sim with external services and tools to unlock powerful capabilities
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Google Calendar Integration */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50">
              <CardHeader>
                <div className="space-y-4">
                  {loading ? (
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted border w-fit">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground">Checking...</span>
                    </div>
                  ) : isConnected ? (
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 w-fit">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-xs font-medium text-green-600">Connected</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted border w-fit">
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground">Disconnected</span>
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-xl mb-2 flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Google Calendar
                    </CardTitle>
                    <CardDescription>
                      Sync events and schedules
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Connect your Google Calendar to schedule and manage events directly through your Sim.
                </p>
                <Button
                  className="w-full"
                  disabled
                  variant="secondary"
                >
                  Coming Soon
                </Button>
              </CardContent>
            </Card>

            {/* Helius Solana Explorer Integration */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-2 border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent">
              <CardHeader>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 w-fit">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-xs font-medium text-green-600">Connected</span>
                  </div>
                  <div>
                    <CardTitle className="text-xl mb-2 flex items-center gap-2">
                      <Hexagon className="h-5 w-5 text-purple-600" />
                      Solana Explorer
                    </CardTitle>
                    <CardDescription>
                      Blockchain data access
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Access to Solana blockchain data including wallet portfolios and transaction history for all users
                </p>
              </CardContent>
            </Card>

            {/* PumpFun CA Reader Integration */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-2 border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-transparent">
              <CardHeader>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 w-fit">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-xs font-medium text-green-600">Connected</span>
                  </div>
                  <div>
                    <CardTitle className="text-xl mb-2 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-orange-600" />
                      PumpFun CA Reader
                    </CardTitle>
                    <CardDescription>
                      Token analysis and trading insights
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Real-time PumpFun token analysis including trading volume, holder metrics, and risk assessment powered by PumpPortal
                </p>
              </CardContent>
            </Card>

            {/* X Intelligence Reports Integration */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-2 border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent">
              <CardHeader>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 w-fit">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-xs font-medium text-green-600">Connected</span>
                  </div>
                  <div>
                    <CardTitle className="text-xl mb-2 flex items-center gap-2">
                      <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                      X Intelligence Reports
                    </CardTitle>
                    <CardDescription>
                      Twitter account analytics
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Generate comprehensive intelligence reports on X (Twitter) accounts including engagement metrics, posting frequency, and audience insights
                </p>
              </CardContent>
            </Card>

            {/* Placeholder for future integrations */}
            <Card className="group relative overflow-hidden border-2 border-dashed hover:border-primary/50 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="relative">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 border border-dashed w-fit">
                    <Plug className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">Available Soon</span>
                  </div>
                  <div>
                    <CardTitle className="text-xl mb-2">More Coming Soon</CardTitle>
                    <CardDescription>
                      Additional integrations
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-sm text-muted-foreground">
                  We're working on bringing you more powerful integrations to enhance your Sim's capabilities.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Integrations;
