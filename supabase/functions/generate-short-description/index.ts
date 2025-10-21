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
    const { systemPrompt } = await req.json();
    
    if (!systemPrompt) {
      throw new Error("System prompt is required");
    }

    const API_KEY = Deno.env.get("API_KEY");
    if (!API_KEY) {
      throw new Error("API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are an expert copywriter. Generate a compelling, concise description (1-2 sentences, max 150 characters) that summarizes what this AI does based on its system prompt. Make it engaging and clear for users. Return ONLY the description text, nothing else."
          },
          {
            role: "user",
            content: `Based on this system prompt, write a short 1-2 sentence description:\n\n${systemPrompt}`
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
    const shortDescription = data.choices?.[0]?.message?.content?.trim();

    if (!shortDescription) {
      throw new Error("Failed to generate short description");
    }

    return new Response(
      JSON.stringify({ shortDescription }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating short description:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
