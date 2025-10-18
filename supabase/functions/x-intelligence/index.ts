import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { username, reportType = 'profile' } = await req.json();
    
    if (!username) {
      throw new Error('Username is required');
    }

    const TWITTER_API_KEY = Deno.env.get('TWITTER_API_IO_KEY');
    if (!TWITTER_API_KEY) {
      throw new Error('Twitter API key not configured');
    }

    console.log(`Generating ${reportType} report for @${username}`);

    // Fetch user profile using the correct endpoint format
    const userResponse = await fetch(
      `https://api.twitterapi.io/twitter/user/info?userName=${encodeURIComponent(username)}`,
      {
        method: 'GET',
        headers: {
          'x-api-key': TWITTER_API_KEY,
        },
      }
    );

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.error('Twitter API user lookup error:', errorText);
      throw new Error(`Failed to fetch user data: ${userResponse.status}`);
    }

    const userData = await userResponse.json();
    console.log('User data fetched:', JSON.stringify(userData));

    // Check if the API returned an error
    if (userData.status === 'error' || !userData.data) {
      throw new Error(userData.msg || 'User not found');
    }

    // Fetch recent tweets
    const tweetsResponse = await fetch(
      `https://api.twitterapi.io/twitter/user/last_tweets?userName=${encodeURIComponent(username)}&count=50`,
      {
        method: 'GET',
        headers: {
          'x-api-key': TWITTER_API_KEY,
        },
      }
    );

    let tweets = [];
    if (tweetsResponse.ok) {
      const tweetsData = await tweetsResponse.json();
      tweets = tweetsData.tweets || tweetsData.data || [];
      console.log(`Fetched ${tweets.length} tweets`);
    }

    // Generate intelligence report
    const report = generateIntelligenceReport(userData, tweets, reportType);

    return new Response(
      JSON.stringify({ success: true, report }),
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
  const user = userData.user || userData.data || userData;
  
  // Calculate engagement metrics
  const totalLikes = tweets.reduce((sum, t) => sum + (t.favorite_count || t.public_metrics?.like_count || 0), 0);
  const totalRetweets = tweets.reduce((sum, t) => sum + (t.retweet_count || t.public_metrics?.retweet_count || 0), 0);
  const totalReplies = tweets.reduce((sum, t) => sum + (t.reply_count || t.public_metrics?.reply_count || 0), 0);
  const avgEngagement = tweets.length > 0 ? (totalLikes + totalRetweets + totalReplies) / tweets.length : 0;

  // Analyze posting frequency
  const tweetDates = tweets
    .map(t => new Date(t.created_at))
    .filter(d => !isNaN(d.getTime()));
  
  let postingFrequency = 'Unknown';
  if (tweetDates.length > 1) {
    const daysDiff = (tweetDates[0].getTime() - tweetDates[tweetDates.length - 1].getTime()) / (1000 * 60 * 60 * 24);
    const tweetsPerDay = tweets.length / Math.max(daysDiff, 1);
    
    if (tweetsPerDay > 5) postingFrequency = 'Very Active (5+ tweets/day)';
    else if (tweetsPerDay > 2) postingFrequency = 'Active (2-5 tweets/day)';
    else if (tweetsPerDay > 0.5) postingFrequency = 'Moderate (1-2 tweets/day)';
    else postingFrequency = 'Low (< 1 tweet/day)';
  }

  // Extract topics and hashtags
  const hashtags = new Set<string>();
  const mentions = new Set<string>();
  tweets.forEach(tweet => {
    const text = tweet.full_text || tweet.text || '';
    const hashtagMatches = text.match(/#\w+/g) || [];
    const mentionMatches = text.match(/@\w+/g) || [];
    hashtagMatches.forEach(h => hashtags.add(h));
    mentionMatches.forEach(m => mentions.add(m));
  });

  const followers = user.followers || user.followers_count || user.public_metrics?.followers_count || 0;
  const following = user.following || user.friends_count || user.public_metrics?.following_count || 0;
  const totalTweets = user.statusesCount || user.statuses_count || user.public_metrics?.tweet_count || 0;

  const report: any = {
    username: user.userName || user.username || user.screen_name,
    displayName: user.name,
    bio: user.description || user.bio,
    location: user.location,
    verified: user.verified || user.isVerified || false,
    
    metrics: {
      followers,
      following,
      totalTweets,
    },
    
    insights: generateInsights(user, tweets, {
      totalLikes,
      totalRetweets,
      totalReplies,
      avgEngagement,
    }),
  };

  // Only include engagement if there's actual activity
  if (tweets.length > 0 && avgEngagement > 0) {
    report.engagement = {
      avgLikesPerTweet: (totalLikes / tweets.length).toFixed(1),
      avgRetweetsPerTweet: (totalRetweets / tweets.length).toFixed(1),
      avgRepliesPerTweet: (totalReplies / tweets.length).toFixed(1),
    };
  }

  // Only include activity details if there are tweets
  if (tweets.length > 0) {
    report.activity = {
      postingFrequency,
      recentTweetCount: tweets.length,
      topHashtags: Array.from(hashtags).slice(0, 5),
      frequentMentions: Array.from(mentions).slice(0, 5),
    };
  }

  return report;
}

function generateInsights(user: any, tweets: any[], metrics: any) {
  const insights = [];
  
  const followerCount = user.followers || user.followers_count || user.public_metrics?.followers_count || 0;
  const followingCount = user.following || user.friends_count || user.public_metrics?.following_count || 0;
  
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
  if (user.verified) {
    insights.push('✓ Verified account');
  }
  
  if (insights.length === 0) {
    insights.push('👤 Standard account profile');
  }
  
  return insights;
}
