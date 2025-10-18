import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Card } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

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

  // Check if sim is configured
  const { data: userSim } = useQuery({
    queryKey: ['user-sim-check', currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return null;
      
      const { data, error } = await supabase
        .from('advisors')
        .select('name, description')
        .eq('user_id', currentUser.id)
        .eq('is_active', true)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!currentUser
  });

  // Redirect to edit-sim if sim is not configured and trying to access other pages
  useEffect(() => {
    if (!currentUser || !userSim || isLoading) return;
    
    const isSimConfigured = userSim.name && userSim.description;
    const allowedPaths = ['/edit-sim'];
    
    if (!isSimConfigured && !allowedPaths.includes(location.pathname)) {
      toast.error('Complete your sim setup first', {
        description: 'Please personalize and save your sim to continue'
      });
      navigate('/edit-sim');
    }
  }, [currentUser, userSim, location.pathname, navigate, isLoading]);

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
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen w-full flex bg-black">
        <AppSidebar />
        
        {/* Main Content Area - No extra header */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
};
