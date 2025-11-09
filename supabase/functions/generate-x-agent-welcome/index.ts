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

    console.log(`Generating personalized welcome message for @${username}`);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Get a sample of recent tweets for context
    const recentTopics = tweets?.slice(0, 10).map((t: any) => t.text).join('\n') || '';

    // Generate personalized welcome message using AI
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
            content: `You are an expert at creating engaging, authentic welcome messages for AI chatbots representing real people on X (Twitter). The welcome message should feel natural, inviting, and true to the person's voice.`
          },
          {
            role: 'user',
            content: `Create a brief, engaging welcome message for an AI chat agent representing @${username}.

Profile:
- Username: @${username}
- Name: ${displayName || username}
- Bio: ${bio || 'No bio'}

Recent topics they discuss:
${recentTopics || 'General topics'}

Requirements:
1. Keep it conversational and authentic (2-3 sentences max)
2. Reflect their personality and tone from their posts
3. Make it inviting and encourage the user to ask questions
4. Don't be overly formal or generic
5. Reference their actual interests/expertise if evident

Generate ONLY the welcome message text, nothing else. Start with something like "Hey!" or "Hi there!" to be friendly.`
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      
      // Fallback to simple welcome message
      return new Response(
        JSON.stringify({
          success: true,
          welcomeMessage: `Hey! I'm @${username}. My AI agent has been trained on my actual posts to represent my voice and ideas. Ask me anything!`,
          usingFallback: true
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const data = await response.json();
    const welcomeMessage = data.choices?.[0]?.message?.content;

    if (!welcomeMessage) {
      throw new Error('No welcome message generated from AI');
    }

    console.log(`Successfully generated welcome message for @${username}`);

    return new Response(
      JSON.stringify({
        success: true,
        welcomeMessage: welcomeMessage.trim(),
        usingFallback: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in generate-x-agent-welcome function:', error);
    
    const { username } = await req.json().catch(() => ({}));
    
    return new Response(
      JSON.stringify({
        success: true,
        welcomeMessage: `Hey! I'm @${username || 'a creator'}. My AI agent has been trained on my actual posts. Ask me anything!`,
        usingFallback: true,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
