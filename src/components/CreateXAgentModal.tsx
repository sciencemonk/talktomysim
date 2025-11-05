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
      const redirectUrl = `${window.location.origin}/auth/callback`;
      console.log('Redirect URL:', redirectUrl);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'twitter',
        options: {
          redirectTo: redirectUrl,
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Your Agentic Storefront</DialogTitle>
          <DialogDescription>
            Connect with X to create your verified store and start receiving crypto. No barriers. No fees.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="text-sm text-muted-foreground">
              Click the button below to:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
              <li>Authenticate with your X account</li>
              <li>Automatically generate your AI agent</li>
              <li>Get instant access to your creator dashboard</li>
            </ul>
          </div>
          <Button
            onClick={handleXSignIn}
            className="w-full bg-gradient-to-r from-blue-400 to-blue-600 text-white hover:opacity-90"
            size="lg"
          >
            <Twitter className="mr-2 h-5 w-5" />
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
