import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Card } from '@/components/ui/card';
import { Menu } from 'lucide-react';

export const AuthenticatedLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user ?? null);
      if (!session) {
        navigate('/');
      }
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
      if (!session) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Card className="p-6 bg-white/10 backdrop-blur-md border-white/20">
          <p className="text-white">Loading...</p>
        </Card>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen w-full flex flex-col bg-black">
        {/* Mobile/Tablet Header with Menu Trigger */}
        <header className="lg:hidden flex items-center h-14 px-4 border-b border-border/40 bg-black">
          <SidebarTrigger className="text-white">
            <Menu className="h-6 w-6" />
          </SidebarTrigger>
          <div className="flex items-center gap-2 ml-4">
            <img 
              src="/sim-logo.png" 
              alt="Sim Logo" 
              className="h-6 w-6 object-contain"
            />
          </div>
        </header>
        
        <div className="flex-1 flex w-full overflow-hidden">
          <AppSidebar />
          
          {/* Main Content Area */}
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
