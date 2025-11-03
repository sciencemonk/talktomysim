import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
  
  console.log("Environment variables check:");
  console.log("- API_KEY length:", API_KEY?.length);
  console.log("- API_SECRET length:", API_SECRET?.length);
  console.log("- ACCESS_TOKEN length:", ACCESS_TOKEN?.length);
  console.log("- ACCESS_TOKEN_SECRET length:", ACCESS_TOKEN_SECRET?.length);
}

function generateOAuthSignature(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerSecret: string,
  tokenSecret: string
): string {
  // Percent-encode each parameter name and value individually, then sort
  const signatureBaseString = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(
    Object.entries(params)
      .sort()
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join("&")
  )}`;
  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`;
  const hmacSha1 = createHmac("sha1", signingKey);
  return hmacSha1.update(signatureBaseString).digest("base64");
}

function generateOAuthHeader(method: string, url: string): string {
  // Parse URL to extract base URL and query parameters
  const urlObj = new URL(url);
  const baseUrl = `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
  
  // Extract query parameters
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

  // Combine OAuth params and query params for signature
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
    validateEnvironmentVariables();
    
    const { username, reportType = 'profile' } = await req.json();
    
    if (!username) {
      throw new Error('Username is required');
    }

    console.log(`Generating ${reportType} report for @${username}`);

    // Fetch user profile using official X API v2
    const userUrl = `https://api.x.com/2/users/by/username/${username}?user.fields=description,public_metrics,profile_image_url,verified,verified_type,created_at,location`;
    const userOAuthHeader = generateOAuthHeader("GET", userUrl);

    console.log("Request URL:", userUrl);
    console.log("OAuth header (first 50 chars):", userOAuthHeader.substring(0, 50) + "...");

    const userResponse = await fetch(userUrl, {
      method: "GET",
      headers: { Authorization: userOAuthHeader },
    });

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.error('X API user lookup error status:', userResponse.status);
      console.error('X API user lookup error body:', errorText);
      console.error('Request headers sent:', { Authorization: userOAuthHeader.substring(0, 100) + "..." });
      throw new Error(`Failed to fetch user data: ${userResponse.status}`);
    }

    const userResponseData = await userResponse.json();
    console.log('User data received:', JSON.stringify(userResponseData).substring(0, 200));

    const userId = userResponseData.data?.id;
    if (!userId) {
      throw new Error('User ID not found in response');
    }

    // Fetch recent tweets using official X API v2
    const tweetsUrl = `https://api.x.com/2/users/${userId}/tweets?max_results=100&tweet.fields=created_at,public_metrics,text`;
    const tweetsOAuthHeader = generateOAuthHeader("GET", tweetsUrl);

    const tweetsResponse = await fetch(tweetsUrl, {
      method: "GET",
      headers: { Authorization: tweetsOAuthHeader },
    });

    let tweets: any[] = [];
    if (tweetsResponse.ok) {
      try {
        const tweetsData = await tweetsResponse.json();
        tweets = tweetsData.data || [];
        console.log(`Successfully fetched ${tweets.length} tweets`);
      } catch (e) {
        console.error('Error parsing tweets response:', e);
        tweets = [];
      }
    } else {
      console.warn(`Tweets API returned status ${tweetsResponse.status}`);
    }

    // Generate intelligence report
    const report = generateIntelligenceReport(userResponseData, tweets, reportType);

    return new Response(
      JSON.stringify({ 
        success: true, 
        report,
        tweets: tweets.map((t: any) => ({
          text: t.text || '',
          created_at: t.created_at,
          favorite_count: t.public_metrics?.like_count || 0,
          retweet_count: t.public_metrics?.retweet_count || 0,
          reply_count: t.public_metrics?.reply_count || 0,
        }))
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in x-intelligence function:', error);
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

function generateIntelligenceReport(userData: any, tweets: any[], reportType: string) {
  const user = userData.data;
  
  // Extract profile image and convert to full size
  let profileImageUrl = user.profile_image_url;
  if (profileImageUrl && profileImageUrl.includes('_normal')) {
    profileImageUrl = profileImageUrl.replace('_normal', '_400x400');
  }
  
  // Ensure tweets is an array
  const safeTweets = Array.isArray(tweets) ? tweets : [];
  
  // Calculate engagement metrics
  const totalLikes = safeTweets.reduce((sum, t) => sum + (t.public_metrics?.like_count || 0), 0);
  const totalRetweets = safeTweets.reduce((sum, t) => sum + (t.public_metrics?.retweet_count || 0), 0);
  const totalReplies = safeTweets.reduce((sum, t) => sum + (t.public_metrics?.reply_count || 0), 0);
  const avgEngagement = safeTweets.length > 0 ? (totalLikes + totalRetweets + totalReplies) / safeTweets.length : 0;

  // Analyze posting frequency
  const tweetDates = safeTweets
    .map(t => new Date(t.created_at))
    .filter(d => !isNaN(d.getTime()));
  
  let postingFrequency = 'Unknown';
  if (tweetDates.length > 1) {
    const daysDiff = (tweetDates[0].getTime() - tweetDates[tweetDates.length - 1].getTime()) / (1000 * 60 * 60 * 24);
    const tweetsPerDay = safeTweets.length / Math.max(daysDiff, 1);
    
    if (tweetsPerDay > 5) postingFrequency = 'Very Active (5+ tweets/day)';
    else if (tweetsPerDay > 2) postingFrequency = 'Active (2-5 tweets/day)';
    else if (tweetsPerDay > 0.5) postingFrequency = 'Moderate (1-2 tweets/day)';
    else postingFrequency = 'Low (< 1 tweet/day)';
  }

  // Extract topics and hashtags
  const hashtags = new Set<string>();
  const mentions = new Set<string>();
  safeTweets.forEach(tweet => {
    const text = tweet.text || '';
    const hashtagMatches = text.match(/#\w+/g) || [];
    const mentionMatches = text.match(/@\w+/g) || [];
    hashtagMatches.forEach(h => hashtags.add(h));
    mentionMatches.forEach(m => mentions.add(m));
  });

  const followers = user.public_metrics?.followers_count || 0;
  const following = user.public_metrics?.following_count || 0;
  const totalTweets = user.public_metrics?.tweet_count || 0;

  const report: any = {
    username: user.username,
    displayName: user.name,
    bio: user.description,
    location: user.location,
    verified: user.verified || user.verified_type === 'blue',
    profileImageUrl: profileImageUrl,
    
    metrics: {
      followers,
      following,
      totalTweets,
    },
    
    insights: generateInsights(user, safeTweets, {
      totalLikes,
      totalRetweets,
      totalReplies,
      avgEngagement,
    }),
  };

  // Only include engagement if there's actual activity
  if (safeTweets.length > 0 && avgEngagement > 0) {
    report.engagement = {
      avgLikesPerTweet: (totalLikes / safeTweets.length).toFixed(1),
      avgRetweetsPerTweet: (totalRetweets / safeTweets.length).toFixed(1),
      avgRepliesPerTweet: (totalReplies / safeTweets.length).toFixed(1),
    };
  }

  // Only include activity details if there are tweets
  if (safeTweets.length > 0) {
    report.activity = {
      postingFrequency,
      recentTweetCount: safeTweets.length,
      topHashtags: Array.from(hashtags).slice(0, 5),
      frequentMentions: Array.from(mentions).slice(0, 5),
    };
  }

  return report;
}

function generateInsights(user: any, tweets: any[], metrics: any) {
  const insights = [];
  
  const followerCount = user.public_metrics?.followers_count || 0;
  const followingCount = user.public_metrics?.following_count || 0;
  
  // Follower insights
  if (followerCount > 100000) {
    insights.push('🌟 High-influence account with 100K+ followers');
  } else if (followerCount > 10000) {
    insights.push('📈 Growing influence with 10K+ followers');
  } else if (followerCount > 1000) {
    insights.push('🎯 Established presence with 1K+ followers');
  }
  
  // Engagement insights
  if (metrics.avgEngagement > 1000) {
    insights.push('🔥 Exceptional engagement per tweet (1000+ avg interactions)');
  } else if (metrics.avgEngagement > 100) {
    insights.push('💪 Strong engagement per tweet (100+ avg interactions)');
  }
  
  // Following ratio
  const ratio = followingCount > 0 ? followerCount / followingCount : 0;
  if (ratio > 10) {
    insights.push('⭐ High follower-to-following ratio (likely influencer)');
  } else if (ratio < 0.5) {
    insights.push('👥 Active networker (follows more than followed)');
  }
  
  // Activity insights
  if (tweets.length >= 50) {
    insights.push('📊 Very active account (50+ recent tweets analyzed)');
  }
  
  // Verification
  if (user.verified || user.verified_type) {
    insights.push('✓ Verified account');
  }
  
  if (insights.length === 0) {
    insights.push('👤 Standard account profile');
  }
  
  return insights;
}
