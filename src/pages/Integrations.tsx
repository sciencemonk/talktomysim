import { useEffect, useState } from "react";
import { Loader2, Menu, Plug, Calendar, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
      const { data, error } = await supabase.functions.invoke('google-oauth-callback', {
        body: { code, userToken }
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

      const { data, error } = await supabase.functions.invoke('google-oauth', {
        body: { userToken: session.access_token }
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
            <h1 className="text-lg font-semibold">Integrations</h1>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </div>
      )}
      
      <div className={`h-full max-w-7xl mx-auto p-8 ${isMobile ? 'pt-[73px]' : ''}`}>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Integrations</h1>
            <p className="text-muted-foreground mt-2">
              Connect your Sim with external services and tools
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Google Calendar Integration */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Google Calendar</CardTitle>
                      <CardDescription className="text-xs">
                        Sync events and schedules
                      </CardDescription>
                    </div>
                  </div>
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  ) : isConnected ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Connect your Google Calendar to schedule and manage events directly through your Sim.
                </p>
                {isConnected ? (
                  <Button
                    onClick={disconnectGoogleCalendar}
                    variant="destructive"
                    className="w-full"
                    disabled={loading}
                  >
                    Disconnect
                  </Button>
                ) : (
                  <Button
                    onClick={connectGoogleCalendar}
                    className="w-full"
                    disabled={connecting || loading}
                  >
                    {connecting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Connecting...
                      </>
                    ) : (
                      'Connect'
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Placeholder for future integrations */}
            <Card className="opacity-50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                    <Plug className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <CardTitle>More Coming Soon</CardTitle>
                    <CardDescription className="text-xs">
                      Additional integrations
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  We're working on bringing you more powerful integrations.
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
