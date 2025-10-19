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

  // Show onboarding modal for new users
  useEffect(() => {
    if (!currentUser || isLoading || userSim === undefined) return;
    
    // Show onboarding only if user has no sim and hasn't seen onboarding before
    const hasSeenOnboarding = localStorage.getItem(`onboarding_seen_${currentUser.id}`);
    if (userSim === null && !hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, [currentUser, userSim, isLoading]);

  const handleOnboardingComplete = async () => {
    setShowOnboarding(false);
    // Refetch both sim queries to ensure the new sim is loaded
    await queryClient.invalidateQueries({ queryKey: ['user-sim-check'] });
    await queryClient.invalidateQueries({ queryKey: ['user-sim'] });
    // Navigate to home after creating sim
    navigate('/home');
  };

  const handleOnboardingSkip = () => {
    setShowOnboarding(false);
    // Mark as seen so we don't show it again
    if (currentUser) {
      localStorage.setItem(`onboarding_seen_${currentUser.id}`, 'true');
    }
    navigate('/directory');
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
          onSkip={handleOnboardingSkip}
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
