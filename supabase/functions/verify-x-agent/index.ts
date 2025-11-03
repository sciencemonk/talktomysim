import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { createHmac } from "node:crypto";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const API_KEY = Deno.env.get("TWITTER_CONSUMER_KEY")?.trim();
const API_SECRET = Deno.env.get("TWITTER_CONSUMER_SECRET")?.trim();
const ACCESS_TOKEN = Deno.env.get("TWITTER_ACCESS_TOKEN")?.trim();
const ACCESS_TOKEN_SECRET = Deno.env.get("TWITTER_ACCESS_TOKEN_SECRET")?.trim();

function generateOAuthSignature(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerSecret: string,
  tokenSecret: string
): string {
  const urlObj = new URL(url);
  const baseUrl = `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
  
  const queryParams: Record<string, string> = {};
  urlObj.searchParams.forEach((value, key) => {
    queryParams[key] = value;
  });
  
  const allParams = { ...params, ...queryParams };
  const signatureBaseString = `${method}&${encodeURIComponent(baseUrl)}&${encodeURIComponent(
    Object.entries(allParams)
      .sort()
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join("&")
  )}`;
  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`;
  const hmacSha1 = createHmac("sha1", signingKey);
  return hmacSha1.update(signatureBaseString).digest("base64");
}

function generateOAuthHeader(method: string, url: string): string {
  const urlObj = new URL(url);
  const baseUrl = `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
  
  const queryParams: Record<string, string> = {};
  urlObj.searchParams.forEach((value, key) => {
    queryParams[key] = value;
  });
  
  const oauthParams = {
    oauth_consumer_key: API_KEY!,
    oauth_nonce: Math.random().toString(36).substring(2),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: ACCESS_TOKEN!,
    oauth_version: "1.0",
  };

  const allParams = { ...oauthParams, ...queryParams };
  const signature = generateOAuthSignature(method, baseUrl, allParams, API_SECRET!, ACCESS_TOKEN_SECRET!);
  const signedOAuthParams = { ...oauthParams, oauth_signature: signature };

  return "OAuth " + Object.entries(signedOAuthParams)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([k, v]) => `${encodeURIComponent(k)}="${encodeURIComponent(v)}"`)
    .join(", ");
}

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

      // Fetch user's recent tweets
      try {
        const userUrl = `https://api.x.com/2/users/by/username/${xUsername}`;
        const userOAuthHeader = generateOAuthHeader("GET", userUrl);

        const userResponse = await fetch(userUrl, {
          method: "GET",
          headers: { Authorization: userOAuthHeader },
        });

        if (!userResponse.ok) {
          console.log(`Failed to fetch user ${xUsername}: ${userResponse.status}`);
          continue;
        }

        const userData = await userResponse.json();
        const userId = userData.data?.id;

        if (!userId) {
          console.log(`No user ID found for ${xUsername}`);
          continue;
        }

        // Fetch recent tweets
        const tweetsUrl = `https://api.x.com/2/users/${userId}/tweets?max_results=10`;
        const tweetsOAuthHeader = generateOAuthHeader("GET", tweetsUrl);

        const tweetsResponse = await fetch(tweetsUrl, {
          method: "GET",
          headers: { Authorization: tweetsOAuthHeader },
        });

        if (!tweetsResponse.ok) {
          console.log(`Failed to fetch tweets for ${xUsername}: ${tweetsResponse.status}`);
          continue;
        }

        const tweetsData = await tweetsResponse.json();
        const tweets = tweetsData.data || [];

        // Check if any tweet contains the verification text
        const verificationText = agent.verification_post_required || 'Verify me on $SIMAI';
        const hasVerificationPost = tweets.some((tweet: any) => 
          tweet.text?.includes(verificationText)
        );

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
