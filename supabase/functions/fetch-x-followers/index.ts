import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TwitterUserResponse {
  data: {
    public_metrics: {
      followers_count: number;
      following_count: number;
      tweet_count: number;
    };
    profile_image_url: string;
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const twitterApiKey = Deno.env.get('TWITTER_API_IO_KEY');

    if (!twitterApiKey) {
      throw new Error('Twitter API key not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { username } = await req.json();

    if (!username) {
      throw new Error('Username is required');
    }

    console.log(`Fetching follower data for @${username}`);

    // Fetch user data from Twitter API
    const twitterResponse = await fetch(
      `https://api.twitterapi.io/users/by/username/${username}?user.fields=public_metrics,profile_image_url`,
      {
        headers: {
          'Authorization': `Bearer ${twitterApiKey}`,
        },
      }
    );

    if (!twitterResponse.ok) {
      const errorText = await twitterResponse.text();
      console.error('Twitter API error:', errorText);
      throw new Error(`Twitter API error: ${twitterResponse.status}`);
    }

    const userData: TwitterUserResponse = await twitterResponse.json();
    const followersCount = userData.data.public_metrics.followers_count;
    const avatarUrl = userData.data.profile_image_url.replace('_normal', '_400x400');

    console.log(`Found ${followersCount} followers for @${username}`);

    // Update the advisor record with follower count
    const { data: advisor, error: fetchError } = await supabase
      .from('advisors')
      .select('id, social_links')
      .eq('sim_category', 'Crypto Mail')
      .or(`social_links->x_username.eq.${username},name.eq.@${username}`)
      .single();

    if (fetchError || !advisor) {
      console.error('Advisor not found:', username);
      throw new Error('Advisor not found');
    }

    // Update social_links with follower count and avatar
    const updatedSocialLinks = {
      ...(advisor.social_links || {}),
      followers: followersCount,
      last_updated: new Date().toISOString(),
    };

    const { error: updateError } = await supabase
      .from('advisors')
      .update({
        social_links: updatedSocialLinks,
        avatar_url: avatarUrl,
      })
      .eq('id', advisor.id);

    if (updateError) {
      console.error('Error updating advisor:', updateError);
      throw updateError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        username,
        followers: followersCount,
        avatar_url: avatarUrl,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in fetch-x-followers:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
