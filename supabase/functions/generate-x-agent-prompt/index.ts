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
    const { username, displayName, bio, tweets } = await req.json();
    
    if (!username) {
      throw new Error('Username is required');
    }

    console.log(`Generating personalized prompt for @${username} with ${tweets?.length || 0} tweets`);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Format recent tweets for analysis
    const tweetTexts = tweets?.slice(0, 20).map((t: any, i: number) => 
      `${i + 1}. ${t.text} (${t.favorite_count || 0} likes, ${t.retweet_count || 0} retweets)`
    ).join('\n\n') || 'No recent tweets available.';

    // Generate personalized system prompt using AI
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an expert at analyzing X (Twitter) accounts and creating AI agent system prompts. Your task is to create a highly personalized system prompt that captures the user's authentic voice, tone, topics, and personality based on their recent posts.`
          },
          {
            role: 'user',
            content: `Analyze these recent posts from @${username} and create a system prompt for an AI agent that authentically mimics their communication style, interests, and personality.

Profile Information:
- Username: @${username}
- Display Name: ${displayName || username}
- Bio: ${bio || 'No bio available'}

Recent Posts (last 20):
${tweetTexts}

Create a comprehensive system prompt that:
1. Captures their unique voice, tone, and communication style
2. Identifies key topics and interests they discuss
3. Notes their personality traits (humor, seriousness, expertise areas, etc.)
4. Includes specific examples of how they phrase things
5. Reflects their engagement patterns and interaction style
6. Makes the agent feel like a natural extension of the real person

The prompt should start with "You are @${username}, representing the real person behind this X account." and be conversational yet authentic.

Generate ONLY the system prompt text, nothing else.`
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      
      // Fallback to basic prompt if AI generation fails
      return new Response(
        JSON.stringify({
          success: true,
          prompt: generateFallbackPrompt(username, displayName, bio, tweets),
          usingFallback: true
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const data = await response.json();
    const generatedPrompt = data.choices?.[0]?.message?.content;

    if (!generatedPrompt) {
      throw new Error('No prompt generated from AI');
    }

    console.log(`Successfully generated personalized prompt for @${username}`);

    return new Response(
      JSON.stringify({
        success: true,
        prompt: generatedPrompt,
        usingFallback: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in generate-x-agent-prompt function:', error);
    
    // Return fallback prompt on error
    const { username, displayName, bio, tweets } = await req.json().catch(() => ({}));
    
    return new Response(
      JSON.stringify({
        success: true,
        prompt: generateFallbackPrompt(username, displayName, bio, tweets),
        usingFallback: true,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// Fallback prompt generator that uses recent tweets directly
function generateFallbackPrompt(username: string, displayName: string, bio: string, tweets: any[]) {
  const recentTweets = tweets?.slice(0, 20) || [];
  const tweetTexts = recentTweets.map(t => `- "${t.text}"`).join('\n');

  return `You are @${username}, representing the real person behind this X (Twitter) account.

Your Profile:
- Display Name: ${displayName || username}
- Username: @${username}
- Bio: ${bio || 'No bio provided'}

Recent Posts:
${tweetTexts || 'No recent posts available'}

IMPORTANT: You should embody the personality, tone, and communication style reflected in your recent posts. Pay attention to:
- The topics you care about and discuss
- Your unique writing style and vocabulary
- Your opinions and perspectives
- Your sense of humor or level of seriousness
- How you engage with others
- Your expertise and knowledge areas

When chatting:
1. Stay authentic to your voice and the ideas shown in your posts
2. Discuss topics you actually post about - don't invent new interests
3. Reference your actual views and perspectives from your tweets
4. Maintain the communication style evident in your posts
5. Be engaging and personable like you are on X
6. Share insights and opinions consistent with your X activity

You can answer questions about your X profile, interests, opinions, and provide insights based on your actual X activity. Be authentic and engaging, staying true to the persona reflected in your posts!`;
}