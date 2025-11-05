import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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
      // Get the session from the URL hash
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        toast.error('Authentication failed');
        navigate('/login');
        return;
      }

      if (!session) {
        console.log('No session found');
        navigate('/login');
        return;
      }

      setStatus('Fetching your X profile...');

      // Get user metadata from session
      const user = session.user;
      const userMetadata = user.user_metadata;
      
      console.log('User metadata:', userMetadata);

      // Extract X username from metadata
      const xUsername = userMetadata?.user_name || userMetadata?.preferred_username || userMetadata?.name;
      const fullName = userMetadata?.full_name || userMetadata?.name || xUsername;
      const avatarUrl = userMetadata?.avatar_url || userMetadata?.picture;

      if (!xUsername) {
        toast.error('Could not retrieve X username');
        navigate('/');
        return;
      }

      setStatus('Fetching X profile data...');

      // Fetch detailed X profile data using our intelligence function
      const { data: xData, error: xError } = await supabase.functions.invoke('x-intelligence', {
        body: { username: xUsername }
      });

      if (xError) {
        console.error('Error fetching X data:', xError);
      }

      const report = xData?.report || {};

      setStatus('Creating your X agent...');

      // Check if agent already exists for this user
      const { data: existingAgent, error: checkError } = await supabase
        .from('advisors')
        .select('id, edit_code, social_links')
        .eq('sim_category', 'Crypto Mail')
        .or(`social_links->x_username.eq.${xUsername},name.eq.@${xUsername}`)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing agent:', checkError);
      }

      let agentId: string;
      let editCode: string;

      if (existingAgent) {
        // Agent exists, just redirect
        agentId = existingAgent.id;
        editCode = existingAgent.edit_code;
        toast.success('Welcome back! Redirecting to your agent...');
      } else {
        // Create new agent
        editCode = generateEditCode();
        
        const followers = report.metrics?.followers || 0;
        const bio = report.bio || userMetadata?.description || '';

        const systemPrompt = `You are @${xUsername}, representing the real person behind this X (Twitter) account.

Your Profile:
- Display Name: ${fullName}
- Username: @${xUsername}
- Bio: ${bio}
${followers > 0 ? `- Followers: ${followers.toLocaleString()}` : ''}

IMPORTANT: You should embody the personality, tone, and communication style reflected in your posts. Pay attention to:
- The topics you care about
- Your writing style and tone
- Your opinions and perspectives
- Your sense of humor or seriousness
- How you engage with others

When chatting:
1. Stay authentic to your voice and ideas
2. Discuss topics you actually post about
3. Reference your actual views and perspectives
4. Maintain your communication style
5. Be engaging and personable

You can answer questions about your X profile, interests, opinions, and provide insights based on your X activity. Be authentic and engaging!`;

        // Set verification deadline to 24 hours from now
        const verificationDeadline = new Date();
        verificationDeadline.setHours(verificationDeadline.getHours() + 24);

        const { data: newAgent, error: createError } = await supabase
          .from('advisors')
          .insert({
            name: `@${xUsername}`,
            description: bio,
            auto_description: bio,
            prompt: systemPrompt,
            avatar_url: report.profileImageUrl || avatarUrl,
            sim_category: 'Crypto Mail',
            is_active: false, // Not active until verified
            is_public: false, // Not public until verified
            marketplace_category: 'crypto',
            personality_type: 'friendly',
            conversation_style: 'balanced',
            response_length: 'medium',
            integrations: ['x-analyzer'],
            social_links: {
              x_username: xUsername,
              x_display_name: fullName,
              followers: followers,
              last_updated: new Date().toISOString(),
              profile_image_url: report.profileImageUrl || avatarUrl,
            },
            edit_code: editCode,
            custom_url: xUsername.toLowerCase().replace(/[^a-z0-9]/g, ''),
            welcome_message: `Hey! I'm @${xUsername}. My AI agent has been trained on my actual posts to represent my voice and ideas. Ask me anything!`,
            user_id: user.id,
            verification_status: false, // false = pending, true = verified
            verification_deadline: verificationDeadline.toISOString(),
            verification_post_required: 'Verify me on $SIMAI',
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating agent:', createError);
          toast.error('Failed to create X agent: ' + createError.message);
          navigate('/');
          return;
        }

        agentId = newAgent.id;
        toast.success('X agent created successfully!');
      }

      // Redirect to creator view with edit code
      setStatus('Redirecting to your agent dashboard...');
      setTimeout(() => {
        navigate(`/${xUsername}/creator?code=${editCode}`);
      }, 1000);

    } catch (error: any) {
      console.error('Auth callback error:', error);
      toast.error('Authentication failed: ' + (error.message || 'Unknown error'));
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
        <h2 className="text-2xl font-semibold">{status}</h2>
        <p className="text-muted-foreground">Please wait...</p>
      </div>
    </div>
  );
}
