import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { agentId } = await req.json();
    
    if (!agentId) {
      throw new Error('Agent ID is required');
    }

    console.log(`Training X agent: ${agentId}`);

    // Get the agent's X username
    const { data: agent, error: agentError } = await supabase
      .from('advisors')
      .select('social_links, name')
      .eq('id', agentId)
      .single();

    if (agentError) throw agentError;
    if (!agent) throw new Error('Agent not found');

    const socialLinks = agent.social_links as any;
    const xUsername = socialLinks?.x_username;

    if (!xUsername) {
      throw new Error('Agent does not have an X username configured');
    }

    console.log(`Fetching tweets for @${xUsername}`);

    // Fetch tweets using x-intelligence function
    const { data: xData, error: xError } = await supabase.functions.invoke('x-intelligence', {
      body: { username: xUsername }
    });

    if (xError) {
      console.error('Error fetching X data:', xError);
      throw xError;
    }

    console.log('X intelligence response:', JSON.stringify(xData, null, 2));

    if (!xData?.success || !xData?.tweets) {
      console.error('Invalid X data structure:', xData);
      throw new Error('Failed to fetch tweets from X');
    }

    const tweets = xData.tweets;
    console.log(`Fetched ${tweets.length} tweets`);

    // Format tweets for training
    const formattedTweets = tweets
      .filter((t: any) => t.text && t.text.trim().length > 0)
      .slice(0, 50) // Limit to 50 most recent tweets
      .map((t: any) => ({
        text: t.text,
        created_at: t.created_at,
        engagement: {
          likes: t.favorite_count || 0,
          retweets: t.retweet_count || 0
        }
      }));

    // Update the agent's social_links with tweet history
    const updatedSocialLinks = {
      ...socialLinks,
      tweet_history: formattedTweets,
      last_trained: new Date().toISOString(),
      tweets_count: formattedTweets.length
    };

    const { error: updateError } = await supabase
      .from('advisors')
      .update({ 
        social_links: updatedSocialLinks,
        updated_at: new Date().toISOString()
      })
      .eq('id', agentId);

    if (updateError) {
      console.error('Error updating agent:', updateError);
      throw updateError;
    }

    console.log(`Successfully trained agent with ${formattedTweets.length} tweets`);

    return new Response(
      JSON.stringify({ 
        success: true,
        agentId,
        username: xUsername,
        tweetsProcessed: formattedTweets.length,
        lastTrained: updatedSocialLinks.last_trained
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in train-x-agent function:', error);
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
