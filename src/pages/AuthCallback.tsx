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

      // Fetch detailed X profile data using our intelligence function
      // This is optional - if it fails, we'll continue with OAuth data
      let report: any = {};
      try {
        setStatus('Fetching X profile data...');
        const { data: xData, error: xError } = await supabase.functions.invoke('x-intelligence', {
          body: { username: xUsername }
        });

        if (xError) {
          console.error('X intelligence error (continuing with OAuth data):', xError);
        } else if (xData?.success && xData?.report) {
          report = xData.report;
        }
      } catch (error) {
        console.error('Failed to fetch X intelligence (continuing with OAuth data):', error);
      }

      setStatus('Setting up your X agent...');

      // Generate custom URL from username
      const customUrl = xUsername.toLowerCase().replace(/[^a-z0-9]/g, '');

      // Check if agent already exists - check each condition separately for better reliability
      let existingAgent = null;
      
      // First, try to find by x_username in social_links
      const { data: agentByUsername } = await supabase
        .from('advisors')
        .select('id, edit_code, social_links, user_id, custom_url, is_verified, is_active, verification_status')
        .eq('sim_category', 'Crypto Mail')
        .filter('social_links->x_username', 'eq', xUsername)
        .maybeSingle();
      
      if (agentByUsername) {
        existingAgent = agentByUsername;
      } else {
        // Try by custom_url
        const { data: agentByUrl } = await supabase
          .from('advisors')
          .select('id, edit_code, social_links, user_id, custom_url, is_verified, is_active, verification_status')
          .eq('sim_category', 'Crypto Mail')
          .eq('custom_url', customUrl)
          .maybeSingle();
        
        if (agentByUrl) {
          existingAgent = agentByUrl;
        } else {
          // Finally, try by name
          const { data: agentByName } = await supabase
            .from('advisors')
            .select('id, edit_code, social_links, user_id, custom_url, is_verified, is_active, verification_status')
            .eq('sim_category', 'Crypto Mail')
            .eq('name', `@${xUsername}`)
            .maybeSingle();
          
          if (agentByName) {
            existingAgent = agentByName;
          }
        }
      }

      let agentId: string;
      let editCode: string;

      if (existingAgent) {
        // Agent exists - verify it and associate with user
        agentId = existingAgent.id;
        editCode = existingAgent.edit_code;
        
        // Update agent to verified status and associate with user
        const updateData: any = {
          is_active: true,
          is_verified: true,
          verification_status: true,
        };
        
        // Associate with authenticated user if not already associated
        if (!existingAgent.user_id) {
          updateData.user_id = user.id;
        }
        
        const { error: updateError } = await supabase
          .from('advisors')
          .update(updateData)
          .eq('id', agentId);
        
        if (updateError) {
          console.error('Error updating agent:', updateError);
          toast.error('Failed to verify agent');
        } else {
          console.log('Agent verified and associated with authenticated user');
          if (!existingAgent.user_id) {
            toast.success('Your X agent has been verified and linked to your account!');
          } else {
            toast.success('Welcome back! Your agent is verified.');
          }
        }
      } else {
        // Create new agent - automatically verified via OAuth
        editCode = generateEditCode();
        
        // Use report data if available, otherwise fall back to OAuth metadata
        const followers = report?.metrics?.followers || 0;
        const bio = report?.bio || userMetadata?.description || `AI-powered agent for @${xUsername}`;
        const profileImageUrl = report?.profileImageUrl || avatarUrl || '';

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

        const { data: newAgent, error: createError } = await supabase
          .from('advisors')
          .insert({
            name: `@${xUsername}`,
            description: bio,
            auto_description: bio,
            prompt: systemPrompt,
            avatar_url: profileImageUrl,
            sim_category: 'Crypto Mail',
            is_active: true, // Active immediately - no pending status
            is_public: true,
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
            verification_status: true, // Auto-verified via OAuth
            is_verified: true, // Auto-verified via OAuth
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

      // Wait a moment for session to be fully persisted
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Redirect to creator view (no edit code needed - using X auth)
      setStatus('Redirecting to your dashboard...');
      
      // Navigate to creator page
      navigate(`/${xUsername}/creator`);
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