import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { TopNavBar } from '@/components/TopNavBar';
import { Card } from '@/components/ui/card';

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
  }, [navigate, location]);

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
    <div className="h-screen w-full flex flex-col bg-background overflow-hidden">
      <TopNavBar />
      
      {/* Main Content Area - Full Height */}
      <main className="flex-1 min-h-0 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
};
