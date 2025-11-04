import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TWITTER_API_IO_KEY = Deno.env.get("TWITTER_API_IO_KEY")?.trim();

function validateEnvironmentVariables() {
  if (!TWITTER_API_IO_KEY) {
    throw new Error("Missing TWITTER_API_IO_KEY environment variable");
  }
  console.log("TwitterAPI.io key configured");
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    validateEnvironmentVariables();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { username } = await req.json();
    if (!username) throw new Error('Username is required');

    console.log(`Fetching follower data for @${username}`);

    // Use TwitterAPI.io
    const url = `https://api.twitterapi.io/twitter/user/info?userName=${encodeURIComponent(username)}`;
    const twitterResponse = await fetch(url, {
      method: "GET",
      headers: { 
        "X-API-Key": TWITTER_API_IO_KEY!,
      },
    });

    if (!twitterResponse.ok) {
      const errorText = await twitterResponse.text();
      console.error('TwitterAPI.io error:', twitterResponse.status, errorText);
      throw new Error(`TwitterAPI.io error: ${twitterResponse.status}`);
    }

    const userData = await twitterResponse.json();
    const followersCount = userData.data?.followers || 0;
    const avatarUrl = userData.data?.profilePicture?.replace('_normal', '_400x400') || userData.data?.profilePicture || '';

    console.log(`Found ${followersCount} followers for @${username}`);

    // Update the advisor record with follower count
    // Try multiple queries to find the advisor
    let advisor;
    
    // First try: exact match on x_username in social_links
    const { data: advisorByUsername } = await supabase
      .from('advisors')
      .select('id, social_links')
      .eq('sim_category', 'Crypto Mail')
      .not('social_links', 'is', null)
      .limit(1);

    // Filter in memory for JSON field match (more reliable than jsonb operators)
    if (advisorByUsername && advisorByUsername.length > 0) {
      advisor = advisorByUsername.find(a => 
        a.social_links?.x_username?.toLowerCase() === username.toLowerCase()
      );
    }

    // Second try: match on name field
    if (!advisor) {
      const { data: advisorByName } = await supabase
        .from('advisors')
        .select('id, social_links')
        .eq('sim_category', 'Crypto Mail')
        .or(`name.eq.@${username},name.eq.${username}`)
        .maybeSingle();
      
      advisor = advisorByName;
    }

    if (!advisor) {
      console.error('Advisor not found for username:', username);
      throw new Error(`Advisor not found for username: ${username}`);
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
