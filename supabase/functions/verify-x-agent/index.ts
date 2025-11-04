import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TWITTER_API_IO_KEY = Deno.env.get("TWITTER_API_IO_KEY")?.trim();

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting X agent verification check...');

    // Get all pending agents that need verification
    const { data: pendingAgents, error: agentsError } = await supabase
      .from('advisors')
      .select('id, name, social_links, verification_post_required, verification_deadline')
      .eq('sim_category', 'Crypto Mail')
      .eq('verification_status', 'pending')
      .not('verification_deadline', 'is', null);

    if (agentsError) {
      throw agentsError;
    }

    console.log(`Found ${pendingAgents?.length || 0} pending agents`);

    const results = [];
    const now = new Date();

    for (const agent of pendingAgents || []) {
      const deadline = new Date(agent.verification_deadline);
      const xUsername = agent.social_links?.x_username;

      if (!xUsername) {
        console.log(`Agent ${agent.id} missing x_username`);
        continue;
      }

      // Check if deadline has passed
      if (now > deadline) {
        console.log(`Agent ${agent.id} (@${xUsername}) deadline expired`);
        await supabase
          .from('advisors')
          .update({ verification_status: 'failed' })
          .eq('id', agent.id);
        
        results.push({ agent_id: agent.id, username: xUsername, status: 'failed', reason: 'deadline_expired' });
        continue;
      }

      // Fetch user's recent tweets using TwitterAPI.io
      try {
        const tweetsUrl = `https://api.twitterapi.io/twitter/user/tweets`;
        const tweetsResponse = await fetch(tweetsUrl, {
          method: "POST",
          headers: { 
            "x-api-key": TWITTER_API_IO_KEY!,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            username: xUsername,
            count: 10
          }),
        });

        if (!tweetsResponse.ok) {
          console.log(`Failed to fetch tweets for ${xUsername}: ${tweetsResponse.status}`);
          continue;
        }

        const tweetsData = await tweetsResponse.json();
        const tweets = tweetsData.tweets || [];

        // Check if any tweet contains the verification text
        const verificationText = agent.verification_post_required || 'Verify me on $SIMAI';
        const hasVerificationPost = tweets.some((tweet: any) => {
          const tweetText = tweet.full_text || tweet.text || '';
          return tweetText.includes(verificationText);
        });

        if (hasVerificationPost) {
          console.log(`Agent ${agent.id} (@${xUsername}) verified!`);
          
          // Update agent to verified status
          await supabase
            .from('advisors')
            .update({ 
              verification_status: 'verified',
              verified_at: now.toISOString(),
              is_active: true,
              is_public: true
            })
            .eq('id', agent.id);

          results.push({ agent_id: agent.id, username: xUsername, status: 'verified' });
        } else {
          console.log(`Agent ${agent.id} (@${xUsername}) still pending - no verification post found`);
          results.push({ agent_id: agent.id, username: xUsername, status: 'pending' });
        }
      } catch (error) {
        console.error(`Error checking agent ${agent.id}:`, error);
        results.push({ agent_id: agent.id, username: xUsername, status: 'error', error: error.message });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        checked: results.length,
        results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in verify-x-agent function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
