import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import xIcon from "@/assets/x-icon.png";

const StoreAuth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already authenticated
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Check if they have a store
        const { data: store } = await supabase
          .from('stores')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (store) {
          navigate(`/store/${store.x_username}`);
        } else {
          navigate('/store/onboarding');
        }
      }
    };
    checkUser();
  }, [navigate]);

  const handleXSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'twitter',
        options: {
          redirectTo: `${window.location.origin}/store/onboarding`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast.error(error.message || 'Failed to sign in with X');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="bg-black/90 rounded-lg px-3 py-2 inline-block mb-6">
            <img src="/sim-logo-white.png" alt="SIM" className="h-8 w-auto" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-3">
            Create Your Store
          </h1>
          <p className="text-muted-foreground text-lg">
            Sign in with X to start selling with AI-powered agentic payments
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8">
          <Button
            onClick={handleXSignIn}
            size="lg"
            className="w-full h-14 text-lg font-semibold"
          >
            <img src={xIcon} alt="X" className="w-5 h-5 mr-2" />
            Continue with X
          </Button>

          <p className="text-sm text-muted-foreground mt-6 text-center">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default StoreAuth;
