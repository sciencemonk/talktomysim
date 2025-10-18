import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Card } from '@/components/ui/card';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { OnboardingModal } from '@/components/OnboardingModal';

export const AuthenticatedLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

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

  // Show onboarding modal if sim doesn't exist
  useEffect(() => {
    if (!currentUser || isLoading) return;
    
    // If no sim exists, show onboarding
    if (userSim === null) {
      setShowOnboarding(true);
    }
  }, [currentUser, userSim, isLoading]);

  const handleOnboardingComplete = async () => {
    setShowOnboarding(false);
    // Refetch sim data
    await queryClient.invalidateQueries({ queryKey: ['user-sim-check'] });
    // Navigate to home
    navigate('/home');
  };

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
    <>
      {showOnboarding && currentUser && (
        <OnboardingModal 
          open={showOnboarding} 
          userId={currentUser.id}
          onComplete={handleOnboardingComplete}
        />
      )}
      
      <SidebarProvider defaultOpen={true}>
        <div className="min-h-screen w-full flex bg-black">
          <AppSidebar />
          
          {/* Main Content Area - No extra header */}
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </SidebarProvider>
    </>
  );
};
