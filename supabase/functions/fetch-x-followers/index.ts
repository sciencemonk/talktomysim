import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';
import { createHmac } from "node:crypto";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const API_KEY = Deno.env.get("TWITTER_CONSUMER_KEY")?.trim();
const API_SECRET = Deno.env.get("TWITTER_CONSUMER_SECRET")?.trim();
const ACCESS_TOKEN = Deno.env.get("TWITTER_ACCESS_TOKEN")?.trim();
const ACCESS_TOKEN_SECRET = Deno.env.get("TWITTER_ACCESS_TOKEN_SECRET")?.trim();

function validateEnvironmentVariables() {
  if (!API_KEY) throw new Error("Missing TWITTER_CONSUMER_KEY");
  if (!API_SECRET) throw new Error("Missing TWITTER_CONSUMER_SECRET");
  if (!ACCESS_TOKEN) throw new Error("Missing TWITTER_ACCESS_TOKEN");
  if (!ACCESS_TOKEN_SECRET) throw new Error("Missing TWITTER_ACCESS_TOKEN_SECRET");
}

function generateOAuthSignature(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerSecret: string,
  tokenSecret: string
): string {
  const signatureBaseString = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(
    Object.entries(params)
      .sort()
      .map(([k, v]) => `${k}=${v}`)
      .join("&")
  )}`;
  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`;
  const hmacSha1 = createHmac("sha1", signingKey);
  return hmacSha1.update(signatureBaseString).digest("base64");
}

function generateOAuthHeader(method: string, url: string): string {
  const oauthParams = {
    oauth_consumer_key: API_KEY!,
    oauth_nonce: Math.random().toString(36).substring(2),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: ACCESS_TOKEN!,
    oauth_version: "1.0",
  };

  const signature = generateOAuthSignature(method, url, oauthParams, API_SECRET!, ACCESS_TOKEN_SECRET!);
  const signedOAuthParams = { ...oauthParams, oauth_signature: signature };

  return "OAuth " + Object.entries(signedOAuthParams)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([k, v]) => `${encodeURIComponent(k)}="${encodeURIComponent(v)}"`)
    .join(", ");
}

interface TwitterUserResponse {
  data: {
    id: string;
    name: string;
    username: string;
    profile_image_url: string;
    public_metrics: {
      followers_count: number;
      following_count: number;
      tweet_count: number;
    };
  };
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

    // Use official X API v2
    const url = `https://api.x.com/2/users/by/username/${username}?user.fields=public_metrics,profile_image_url`;
    const oauthHeader = generateOAuthHeader("GET", url);

    const twitterResponse = await fetch(url, {
      method: "GET",
      headers: { Authorization: oauthHeader },
    });

    if (!twitterResponse.ok) {
      const errorText = await twitterResponse.text();
      console.error('X API error:', errorText);
      throw new Error(`X API error: ${twitterResponse.status}`);
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
