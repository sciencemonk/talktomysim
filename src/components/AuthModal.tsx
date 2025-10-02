
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMode?: 'login' | 'signup';
}

const AuthModal = ({ open, onOpenChange, defaultMode = 'signup' }: AuthModalProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSolanaSignIn = async () => {
    setIsLoading(true);
    try {
      if (!(window as any).solana) {
        toast.error('Please install a Solana wallet');
        setIsLoading(false);
        return;
      }

      const { error } = await (supabase.auth as any).signInWithOAuth({
        provider: 'web3',
        options: {
          statement: 'Sign in to Sim with your Solana wallet',
          redirectTo: `${window.location.origin}/app`
        }
      });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error signing in with Solana:', error);
      toast.error('Failed to connect Solana wallet');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center space-y-6 py-4">
          <div className="flex items-center justify-center">
            <img 
              src="/lovable-uploads/a5a8957b-48cb-40f5-9097-0ab747b74077.png" 
              alt="Think With Me" 
              className="w-8 h-8"
            />
          </div>

          <div className="w-full space-y-4">
            <Button
              onClick={handleSolanaSignIn}
              disabled={isLoading}
              className="w-full h-12 text-base bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 text-white hover:opacity-90"
              size="lg"
            >
              {isLoading ? 'Connecting...' : 'Connect Solana Wallet'}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center px-6">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
