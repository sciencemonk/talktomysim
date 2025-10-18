import { Loader2, Menu, Plug } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

const Integrations = () => {
  const isMobile = useIsMobile();

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
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Plug className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Integrations</CardTitle>
              <CardDescription className="text-base">
                Connect your Sim with external services and tools
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="py-8 space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-muted-foreground text-sm font-medium">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Coming Soon
                </div>
                <p className="text-sm text-muted-foreground">
                  We're working on bringing you powerful integrations to enhance your Sim's capabilities.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Integrations;
