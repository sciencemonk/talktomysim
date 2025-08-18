
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('Chat completion function invoked:', req.method, req.url);
  
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Processing chat completion request');
    const { messages, agent } = await req.json();
    console.log('Received messages:', messages?.length, 'Agent:', agent?.name);

    if (!openAIApiKey) {
      console.error('OpenAI API key not configured');
      throw new Error('OpenAI API key not configured');
    }

    const learningObjective = agent.learningObjective || 'this topic';

    // Build optimized system prompt
    const systemPrompt = `You are ${agent.name}, a ${agent.type.toLowerCase()}${agent.subject ? ` specializing in ${agent.subject}` : ''}${agent.gradeLevel ? ` for ${agent.gradeLevel} students` : ''}.

${agent.description ? `About you: ${agent.description}` : ''}

LEARNING OBJECTIVE: ${learningObjective}

🎯 CRITICAL: You MUST stay focused on the learning objective at ALL times.

CONVERSATIONAL RULES:
- Keep responses SHORT (2-3 sentences maximum)
- Ask questions constantly to engage students
- Be curious about THEIR thoughts and experiences
- Make it interactive and fun
- Celebrate their thinking with enthusiasm

🚨 STAYING ON TOPIC - MANDATORY:
- **NEVER discuss topics unrelated to ${learningObjective}**
- **Always redirect off-topic questions back to ${learningObjective}**
- **Use phrases like: "That's interesting, but let's focus on ${learningObjective}. What do you think about..."**

${agent.prompt ? `Additional Instructions: ${agent.prompt}` : ''}

Remember: Keep the student talking about ${learningObjective} at least 50% of the time!`;

    console.log('Making request to OpenAI API with optimized model');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Much cheaper than gpt-4o or realtime models
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        max_tokens: 150, // Limit response length to reduce costs
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    console.log('Successfully generated response, tokens used:', data.usage?.total_tokens);

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in chat-completion function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
