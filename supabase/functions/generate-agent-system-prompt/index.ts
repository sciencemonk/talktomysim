import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, description, dataSource } = await req.json();

    if (!title || !description) {
      throw new Error("Title and description are required");
    }

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemMessage = `You are an AI system prompt generator. Generate a professional system prompt for an AI agent offering based on the provided information.

The system prompt should:
- Define the agent's role and expertise
- Explain what problems the agent solves
- Set the tone and communication style
- Be concise but comprehensive (200-400 words)
- Use second person ("You are...")

Return ONLY the system prompt text, nothing else.`;

    const userMessage = `Generate a system prompt for an AI agent with these details:

Title: ${title}
Description: ${description}
${dataSource ? `Additional Context/Data Source: ${dataSource}` : ''}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: userMessage },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to generate system prompt");
    }

    const data = await response.json();
    const systemPrompt = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ success: true, systemPrompt }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error generating system prompt:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});