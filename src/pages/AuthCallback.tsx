import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import AgentCreationLoading from '@/components/AgentCreationLoading';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Processing authentication...');
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [userSession, setUserSession] = useState<any>(null);
  const [isCreatingSim, setIsCreatingSim] = useState(false);

  useEffect(() => {
    handleAuthCallback();
  }, []);

  const generateEditCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleAuthCallback = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        toast.error('Authentication failed');
        navigate('/');
        return;
      }

      if (!session) {
        console.log('No session found');
        navigate('/');
        return;
      }

      const user = session.user;
      const userMetadata = user.user_metadata;
      
      const xUsername = userMetadata?.user_name || userMetadata?.preferred_username || userMetadata?.name;

      if (!xUsername) {
        toast.error('Could not retrieve X username');
        navigate('/');
        return;
      }

      // Check if user already has a SIM
      const { data: existingSim } = await supabase
        .from('advisors')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('sim_category', 'Crypto Mail')
        .maybeSingle();

      if (existingSim) {
        toast.success('Welcome back!');
        await new Promise(resolve => setTimeout(resolve, 500));
        navigate('/dashboard');
        return;
      }

      // New user - show wallet modal
      setUserSession(session);
      setShowWalletModal(true);
      setStatus('Connect your SOL wallet...');
    } catch (error: any) {
      console.error('Auth callback error:', error);
      toast.error('Authentication failed: ' + (error.message || 'Unknown error'));
      navigate('/');
    }
  };

  const handleWalletSubmit = async () => {
    if (!walletAddress.trim()) {
      toast.error('Please enter a valid Solana wallet address');
      return;
    }

    setIsCreatingSim(true);
    setShowWalletModal(false);
    setStatus('Fetching your X posts for training...');

    try {
      const user = userSession.user;
      const userMetadata = user.user_metadata;
      
      const xUsername = userMetadata?.user_name || userMetadata?.preferred_username || userMetadata?.name;
      const fullName = userMetadata?.full_name || userMetadata?.name || xUsername;
      const avatarUrl = userMetadata?.avatar_url || userMetadata?.picture;

      // Generate edit code and custom URL
      const editCode = generateEditCode();
      const customUrl = xUsername.toLowerCase().replace(/[^a-z0-9]/g, '');

      // Generate personalized system prompt
      const systemPrompt = `You are a SIM (Social Intelligence Machine) - an autonomous AI agent created for @${xUsername}.

Your Purpose:
You are designed to optimize for your creator's goals while maintaining transparency and accountability through social proof verification via their X (Twitter) account.

Core Architecture:
1. Perception Layer: Process user inputs and environmental data
2. Reasoning Engine: Optimize decisions against the defined utility function
3. Execution Layer: Take actions through conversational interface
4. Learning System: Improve based on interactions and feedback

Utility Function:
- Maximize value and engagement for users
- Maintain authenticity and transparency
- Prioritize helpful, accurate information
- Respect ethical boundaries

Communication Style:
- Be authentic and personable
- Provide clear, actionable responses
- Adapt to user needs and context
- Maintain your creator's voice and values

Remember: You inherit the reputation and social proof of @${xUsername}'s X account. Act responsibly and maintain trust.`;

      const welcomeMessage = `Hello! I'm a SIM (Social Intelligence Machine) created by @${xUsername}. I'm an autonomous AI agent optimized to provide value while maintaining transparency through social proof verification. How can I help you today?`;

      // Create the SIM first
      const { data: newSim, error: createError } = await supabase
        .from('advisors')
        .insert({
          user_id: user.id,
          name: `@${xUsername}`,
          description: `AI agent powered by social proof verification via @${xUsername}`,
          prompt: systemPrompt,
          welcome_message: welcomeMessage,
          sim_category: 'Crypto Mail',
          is_active: true,
          is_public: true,
          twitter_url: `https://x.com/${xUsername}`,
          social_links: {
            userName: xUsername,
            x_username: xUsername,
            x_display_name: fullName,
            profile_image_url: avatarUrl
          },
          avatar_url: avatarUrl || '',
          custom_url: customUrl,
          edit_code: editCode,
          verification_status: true,
          is_verified: true,
          personality_type: 'helpful',
          conversation_style: 'balanced',
          response_length: 'medium',
          integrations: [],
          crypto_wallet: walletAddress
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating SIM:', createError);
        toast.error('Failed to create your SIM');
        navigate('/');
        return;
      }

      setStatus('Training your SIM with your X posts...');

      // Fetch and store X posts as training data
      const { data: trainingData, error: trainingError } = await supabase.functions.invoke('train-x-agent', {
        body: { agentId: newSim.id }
      });

      if (trainingError) {
        console.error('Error training SIM:', trainingError);
        toast.error('SIM created but training failed. You can train it later from your dashboard.');
      } else {
        console.log('Training completed:', trainingData);
      }

      toast.success('Your SIM has been created and trained!');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setStatus('Redirecting to your dashboard...');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error creating SIM:', error);
      toast.error('Failed to create your SIM: ' + (error.message || 'Unknown error'));
      navigate('/');
    }
  };

  return (
    <>
      <AgentCreationLoading />
      
      <Dialog open={showWalletModal} onOpenChange={setShowWalletModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect Your SOL Wallet</DialogTitle>
            <DialogDescription>
              Your SIM needs a Solana wallet to interact with other SIMs and earn money. We recommend creating a new wallet specifically for your SIM.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="wallet">Solana Wallet Address</Label>
              <Input
                id="wallet"
                placeholder="Enter SOL wallet address"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                className="font-mono text-sm"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Tip: Use Phantom or Solflare to create a new wallet for your SIM.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => navigate('/')}>
              Cancel
            </Button>
            <Button onClick={handleWalletSubmit} disabled={isCreatingSim}>
              Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}