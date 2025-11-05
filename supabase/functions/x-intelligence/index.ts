import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

// Retry utility with exponential backoff
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3,
  baseDelay = 1000
): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      // If we get a response (even error), return it
      // We'll handle non-OK status codes in the calling code
      return response;
    } catch (error) {
      lastError = error as Error;
      console.error(`Attempt ${attempt + 1}/${maxRetries} failed:`, error.message);
      
      // Don't retry on last attempt
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // If all retries failed, throw the last error
  throw lastError || new Error('All retry attempts failed');
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

    // Remove @ symbol if present
    const cleanUsername = username.replace('@', '');
    console.log(`Generating ${reportType} report for @${cleanUsername}`);
    console.log(`API Key length: ${TWITTER_API_IO_KEY?.length || 0}`);

    // Fetch user profile using TwitterAPI.io with retry logic
    const userUrl = `https://api.twitterapi.io/twitter/user/info?userName=${encodeURIComponent(cleanUsername)}`;
    console.log(`Full request URL: ${userUrl}`);
    
    let userResponse: Response;
    try {
      userResponse = await fetchWithRetry(userUrl, {
        method: "GET",
        headers: {
          "X-API-Key": TWITTER_API_IO_KEY!,
        },
      });
    } catch (error) {
      console.error('Failed to fetch user data after retries:', error.message);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Twitter API temporarily unavailable. Please try again in a moment.',
          details: error.message
        }),
        {
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`Response status: ${userResponse.status}`);
    console.log(`Response statusText: ${userResponse.statusText}`);
    
    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.error('Full error response:', errorText);
      console.error('TwitterAPI.io user lookup error:', userResponse.status, errorText);
      throw new Error(`Failed to fetch user data: ${userResponse.status} - ${errorText}`);
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

    // Fetch recent tweets using TwitterAPI.io with retry logic
    const tweetsUrl = `https://api.twitterapi.io/twitter/user/last_tweets?userName=${encodeURIComponent(username)}&count=100`;
    
    let tweets: any[] = [];
    try {
      const tweetsResponse = await fetchWithRetry(tweetsUrl, {
        method: "GET",
        headers: {
          "X-API-Key": TWITTER_API_IO_KEY!,
        },
      });

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
    } catch (error) {
      console.warn('Failed to fetch tweets after retries, continuing without tweets:', error.message);
      // Continue without tweets - this is non-critical
    }

    // Generate intelligence report
    const report = generateIntelligenceReport(userResponseData, tweets, reportType);

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
