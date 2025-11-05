import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Twitter } from "lucide-react";

interface CreateXAgentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateXAgentModal = ({ open, onOpenChange }: CreateXAgentModalProps) => {
  const handleXSignIn = async () => {
    try {
      console.log('Starting X sign in...');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'twitter',
        options: {
          skipBrowserRedirect: false,
        },
      });

      if (error) {
        console.error('OAuth error:', error);
        throw error;
      }
      
      console.log('OAuth initiated successfully', data);
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error signing in with X:', error);
      toast.error(error?.message || 'Failed to sign in with X');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-2" style={{ borderColor: '#81f4aa' }}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Create Your Agentic Storefront</DialogTitle>
          <DialogDescription className="text-center text-base">
            Connect with X to create your verified store and start receiving crypto. No barriers. No fees.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 pt-2">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="rounded-full p-1 mt-0.5" style={{ backgroundColor: 'rgba(129, 244, 170, 0.2)' }}>
                <svg className="w-4 h-4" style={{ color: '#81f4aa' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-medium">Authenticate with X</p>
                <p className="text-sm text-muted-foreground">Connect your X account securely</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-full p-1 mt-0.5" style={{ backgroundColor: 'rgba(129, 244, 170, 0.2)' }}>
                <svg className="w-4 h-4" style={{ color: '#81f4aa' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-medium">Auto-generate AI Agent</p>
                <p className="text-sm text-muted-foreground">Your agent is created instantly</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-full p-1 mt-0.5" style={{ backgroundColor: 'rgba(129, 244, 170, 0.2)' }}>
                <svg className="w-4 h-4" style={{ color: '#81f4aa' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-medium">Access Creator Dashboard</p>
                <p className="text-sm text-muted-foreground">Start selling immediately</p>
              </div>
            </div>
          </div>
          
          <Button
            onClick={handleXSignIn}
            className="w-full h-12 text-lg font-semibold hover:scale-105 transition-transform"
            style={{ backgroundColor: '#81f4aa', color: '#000' }}
            size="lg"
          >
            <Twitter className="mr-2 h-6 w-6" />
            Get Started with X
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
