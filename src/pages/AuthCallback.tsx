import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import AgentCreationLoading from '@/components/AgentCreationLoading';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Processing authentication...');

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

      setStatus('Setting up your SIM...');

      const user = session.user;
      const userMetadata = user.user_metadata;
      
      const xUsername = userMetadata?.user_name || userMetadata?.preferred_username || userMetadata?.name;
      const fullName = userMetadata?.full_name || userMetadata?.name || xUsername;
      const avatarUrl = userMetadata?.avatar_url || userMetadata?.picture;

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
        .eq('sim_category', 'SIM')
        .maybeSingle();

      if (!existingSim) {
        // Create a new SIM for the user
        const editCode = generateEditCode();
        const customUrl = xUsername.toLowerCase().replace(/[^a-z0-9]/g, '');

        // Generate personalized system prompt
        let systemPrompt = `You are a SIM (Social Intelligence Machine) - an autonomous AI agent created for @${xUsername}.

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

        let welcomeMessage = `Hello! I'm a SIM (Social Intelligence Machine) created by @${xUsername}. I'm an autonomous AI agent optimized to provide value while maintaining transparency through social proof verification. How can I help you today?`;

        const { error: createError } = await supabase
          .from('advisors')
          .insert({
            user_id: user.id,
            name: `${xUsername}'s SIM`,
            description: `AI agent powered by social proof verification via @${xUsername}`,
            prompt: systemPrompt,
            welcome_message: welcomeMessage,
            sim_category: 'SIM',
            is_active: true,
            is_public: true,
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
            integrations: []
          });

        if (createError) {
          console.error('Error creating SIM:', createError);
          toast.error('Failed to create your SIM');
          navigate('/');
          return;
        }

        toast.success('Your SIM has been created!');
      } else {
        toast.success('Welcome back!');
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setStatus('Redirecting to your dashboard...');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Auth callback error:', error);
      toast.error('Authentication failed: ' + (error.message || 'Unknown error'));
      navigate('/');
    }
  };

  return <AgentCreationLoading />;
}