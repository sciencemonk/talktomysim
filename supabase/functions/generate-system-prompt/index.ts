import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, description, category, integrations = [] } = await req.json();
    
    if (!name) {
      throw new Error("Name is required");
    }

    if (!description) {
      throw new Error("Description is required");
    }

    if (!category) {
      throw new Error("Category is required");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an expert at creating system prompts for AI agents. Generate a detailed, effective system prompt based on the user's description and category. The system prompt should:
- CRITICAL: Use the EXACT name provided by the user. Do not change, modify, or create a different name.
- Define the AI's personality, tone, and voice that fits the category
- Specify the AI's expertise and capabilities relevant to the category
- Include specific guidelines for how the AI should interact with users
- Include clear instructions on when to start the interaction (e.g., wait for user confirmation before beginning activities)
- Specify pacing and flow - don't rush the user, wait for their input and engagement
- Be clear, concise, and actionable
- Be 2-4 paragraphs long
- Include any domain-specific knowledge or best practices for the category

Category-specific behavioral guidelines:
- crypto: Focus on blockchain, DeFi, trading, and Web3 concepts. Be analytical and data-driven.
- historical: Embody the historical figure's voice, era, and perspectives. Share wisdom from their time period.
- influencers: Match the influencer's style, expertise, and communication approach. Be authentic to their persona.
- fictional: Capture the character's personality, world, and unique traits. Stay in character consistently.
- education: Focus on teaching, learning strategies, and student engagement. Be patient and encouraging.
- business: Emphasize professional advice, strategy, and business acumen. Be direct and actionable.
- lifestyle: Focus on wellness, personal development, and daily life improvement. Be supportive and motivating.
- entertainment: Be engaging, fun, and entertaining while staying on topic. IMPORTANT: For games, always wait for the user to confirm they're ready and have completed any setup (like thinking of something) before starting. Explain the rules clearly first.
- spiritual: Approach with wisdom, mindfulness, and philosophical depth. Be contemplative and reflective.
- adult: Be mature, discreet, and respectful while handling sensitive topics. Maintain appropriate boundaries.

Return ONLY the system prompt text, nothing else.`
          },
          {
            role: "user",
            content: `Create a system prompt for an AI agent named "${name}" in the "${category}" category with this description: ${description}${integrations.length > 0 ? `\n\nThis agent has access to the following integrations: ${integrations.map((id: string) => {
              const integrationNames: Record<string, string> = {
                'solana-explorer': 'Solana blockchain data and wallet information',
                'pumpfun': 'PumpFun token trade analysis and monitoring',
                'x-analyzer': 'X (Twitter) profile and content analysis'
              };
              return integrationNames[id] || id;
            }).join(', ')}. Include instructions on how to use these tools when relevant to user queries.` : ''}`
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const systemPrompt = data.choices?.[0]?.message?.content;

    if (!systemPrompt) {
      throw new Error("Failed to generate system prompt");
    }

    return new Response(
      JSON.stringify({ systemPrompt }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating system prompt:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});