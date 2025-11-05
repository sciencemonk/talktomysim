import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TWITTER_API_IO_KEY = Deno.env.get("TWITTER_API_IO_KEY")?.trim();
const CACHE_DURATION_HOURS = 6; // Refresh data every 6 hours

// Helper to add delay between API calls to avoid rate limits
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function validateEnvironmentVariables() {
  if (!TWITTER_API_IO_KEY) {
    throw new Error("Missing TWITTER_API_IO_KEY environment variable");
  }
  console.log("TwitterAPI.io key configured");
}


serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    validateEnvironmentVariables();
    
    const { username, reportType = 'profile', forceRefresh = false } = await req.json();
    
    if (!username) {
      throw new Error('Username is required');
    }

    // Remove @ symbol if present
    const cleanUsername = username.replace('@', '');
    console.log(`Generating ${reportType} report for @${cleanUsername}`);
    console.log(`API Key length: ${TWITTER_API_IO_KEY?.length || 0}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check for cached data in database
    if (!forceRefresh) {
      const { data: cachedAgent } = await supabase
        .from('advisors')
        .select('social_links')
        .eq('custom_url', cleanUsername)
        .single();

      if (cachedAgent?.social_links) {
        const socialLinks = cachedAgent.social_links as any;
        const lastFetched = socialLinks.last_twitter_fetch ? new Date(socialLinks.last_twitter_fetch) : null;
        const hoursSinceLastFetch = lastFetched ? (Date.now() - lastFetched.getTime()) / (1000 * 60 * 60) : null;

        // Return cached data if it's less than CACHE_DURATION_HOURS old
        if (hoursSinceLastFetch && hoursSinceLastFetch < CACHE_DURATION_HOURS) {
          console.log(`Using cached data (${hoursSinceLastFetch.toFixed(1)} hours old)`);
          
          const report = generateIntelligenceReport(
            { data: socialLinks }, 
            socialLinks.tweet_history || [],
            reportType
          );

          return new Response(
            JSON.stringify({ 
              success: true, 
              report,
              tweets: (socialLinks.tweet_history || []).map((t: any) => ({
                text: t.text || '',
                created_at: t.createdAt,
                favorite_count: t.likeCount || 0,
                retweet_count: t.retweetCount || 0,
                reply_count: t.replyCount || 0,
              })),
              cached: true,
              cacheAge: hoursSinceLastFetch.toFixed(1)
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }
      }
    }

    console.log('Fetching fresh data from Twitter API...');

    // Fetch user profile using TwitterAPI.io with retry logic
    const userUrl = `https://api.twitterapi.io/twitter/user/info?userName=${encodeURIComponent(cleanUsername)}`;
    console.log(`Full request URL: ${userUrl}`);
    
    let userResponse;
    let retries = 0;
    const maxRetries = 3;
    
    while (retries < maxRetries) {
      userResponse = await fetch(userUrl, {
        method: "GET",
        headers: {
          "X-API-Key": TWITTER_API_IO_KEY!,
        },
      });

      console.log(`Response status: ${userResponse.status}`);
      console.log(`Response statusText: ${userResponse.statusText}`);
      
      // Handle rate limiting with exponential backoff
      if (userResponse.status === 429) {
        retries++;
        if (retries >= maxRetries) {
          throw new Error(`Rate limit exceeded after ${maxRetries} retries. Please try again later.`);
        }
        const waitTime = Math.pow(2, retries) * 1000; // Exponential backoff: 2s, 4s, 8s
        console.log(`Rate limited. Waiting ${waitTime}ms before retry ${retries}/${maxRetries}...`);
        await delay(waitTime);
        continue;
      }
      
      if (!userResponse.ok) {
        const errorText = await userResponse.text();
        console.error('Full error response:', errorText);
        console.error('TwitterAPI.io user lookup error:', userResponse.status, errorText);
        throw new Error(`Failed to fetch user data: ${userResponse.status} - ${errorText}`);
      }
      
      break; // Success, exit loop
    }

    const userResponseData = await userResponse.json();
    console.log('User data received:', JSON.stringify(userResponseData).substring(0, 200));

    // Check if the API returned an error (user not found)
    if (userResponseData.status === 'error' || !userResponseData.data) {
      const errorMessage = userResponseData.msg || 'User not found';
      console.log(`Twitter user not found: ${cleanUsername}`);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: errorMessage,
          username: cleanUsername
        }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Add delay between API calls to avoid rate limits
    await delay(150); // 150ms delay = max ~6-7 requests/sec

    // Fetch recent tweets using TwitterAPI.io with retry logic
    const tweetsUrl = `https://api.twitterapi.io/twitter/user/last_tweets?userName=${encodeURIComponent(cleanUsername)}&count=100`;
    
    let tweets: any[] = [];
    retries = 0;
    
    while (retries < maxRetries) {
      const tweetsResponse = await fetch(tweetsUrl, {
        method: "GET",
        headers: {
          "X-API-Key": TWITTER_API_IO_KEY!,
        },
      });

      if (tweetsResponse.status === 429) {
        retries++;
        if (retries >= maxRetries) {
          console.warn(`Rate limit exceeded for tweets after ${maxRetries} retries. Using empty tweets array.`);
          break;
        }
        const waitTime = Math.pow(2, retries) * 1000;
        console.log(`Rate limited on tweets. Waiting ${waitTime}ms before retry ${retries}/${maxRetries}...`);
        await delay(waitTime);
        continue;
      }

      if (tweetsResponse.ok) {
        try {
          const tweetsData = await tweetsResponse.json();
          tweets = tweetsData.tweets || [];
          console.log(`Successfully fetched ${tweets.length} tweets`);
        } catch (e) {
          console.error('Error parsing tweets response:', e);
          tweets = [];
        }
      } else {
        console.warn(`Tweets API returned status ${tweetsResponse.status}`);
      }
      
      break; // Exit loop after attempt
    }

    // Generate intelligence report
    const report = generateIntelligenceReport(userResponseData, tweets, reportType);

    // Cache the results in the database
    try {
      const userData = userResponseData.data;
      const cacheData = {
        ...userData,
        tweet_history: tweets,
        last_twitter_fetch: new Date().toISOString(),
      };

      await supabase
        .from('advisors')
        .update({ 
          social_links: cacheData,
          avatar_url: report.profileImageUrl 
        })
        .eq('custom_url', cleanUsername);

      console.log('Cached Twitter data in database');
    } catch (cacheError) {
      console.error('Error caching data:', cacheError);
      // Don't fail the request if caching fails
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        report,
        tweets: tweets.map((t: any) => ({
          text: t.text || '',
          created_at: t.createdAt,
          favorite_count: t.likeCount || 0,
          retweet_count: t.retweetCount || 0,
          reply_count: t.replyCount || 0,
        })),
        cached: false,
        freshData: true
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
  let profileImageUrl = user.profilePicture;
  if (profileImageUrl && profileImageUrl.includes('_normal')) {
    profileImageUrl = profileImageUrl.replace('_normal', '_400x400');
  }
  
  // Ensure tweets is an array
  const safeTweets = Array.isArray(tweets) ? tweets : [];
  
  // Calculate engagement metrics
  const totalLikes = safeTweets.reduce((sum, t) => sum + (t.likeCount || 0), 0);
  const totalRetweets = safeTweets.reduce((sum, t) => sum + (t.retweetCount || 0), 0);
  const totalReplies = safeTweets.reduce((sum, t) => sum + (t.replyCount || 0), 0);
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

  const followers = user.followers || 0;
  const following = user.following || 0;
  const totalTweets = user.statusesCount || 0;

  const report: any = {
    username: user.userName,
    displayName: user.name,
    bio: user.description,
    location: user.location,
    verified: user.isBlueVerified || false,
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
  
  const followerCount = user.followers || 0;
  const followingCount = user.following || 0;
  
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
