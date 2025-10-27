import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if a specific advisor is requested
    const { advisorId } = await req.json().catch(() => ({}));

    // Get current time in HH:MM format
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`;
    
    console.log('Checking for briefs to generate at:', currentTime);

    let agents;
    
    if (advisorId) {
      // Generate brief for specific advisor regardless of schedule
      console.log('Generating brief for specific advisor:', advisorId);
      const { data, error: agentsError } = await supabaseClient
        .from('advisors')
        .select('id, name, description, welcome_message, marketplace_category')
        .eq('id', advisorId)
        .eq('sim_category', 'Autonomous Agent')
        .eq('is_active', true)
        .single();
      
      if (agentsError) {
        console.error('Error fetching agent:', agentsError);
        throw agentsError;
      }
      
      agents = data ? [data] : [];
    } else {
      // Find all Autonomous Agent sims with Daily Brief category that are scheduled for current time
      const { data, error: agentsError } = await supabaseClient
        .from('advisors')
        .select('id, name, description, welcome_message, marketplace_category')
        .eq('sim_category', 'Autonomous Agent')
        .eq('marketplace_category', 'Daily Brief')
        .eq('is_active', true);

      if (agentsError) {
        console.error('Error fetching agents:', agentsError);
        throw agentsError;
      }
      
      agents = data || [];
    }

    if (!agents || agents.length === 0) {
      console.log('No autonomous agents found');
      return new Response(
        JSON.stringify({ message: 'No agents to process' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${agents.length} autonomous agent(s)`);

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    let briefsGenerated = 0;

    for (const agent of agents) {
      try {
        // Check if scheduled time matches (welcome_message stores the time) - skip if specific advisor requested
        if (!advisorId && agent.welcome_message !== currentTime) {
          console.log(`Skipping ${agent.name} - scheduled for ${agent.welcome_message}, current time is ${currentTime}`);
          continue;
        }

        console.log(`Generating brief for ${agent.name} on topic: ${agent.description}`);

        // Generate web search query and brief using Lovable AI
        const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${lovableApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              {
                role: 'system',
                content: `You are an expert analyst who creates comprehensive daily briefs on specific topics. Your briefs should be:
- Well-structured with clear sections
- Include the most important developments from the last 24 hours only
- Be informative but concise (300-500 words)
- Include relevant context and implications
- Written in a professional but accessible tone
- Similar to briefings given to executives and decision-makers
- CRITICAL: Only use information from the past 24 hours. Ignore any older news or developments.`
              },
              {
                role: 'user',
                content: `Create a daily brief on the following topic: "${agent.description}"

IMPORTANT: Research ONLY developments from the past 24 hours. Do not include older information.

Please create a comprehensive brief that covers:
1. Key developments in the last 24 hours
2. Important trends or patterns from today
3. Implications and what to watch for next

Format the brief in markdown with clear sections.`
              }
            ],
            tools: [
              {
                type: 'function',
                function: {
                  name: 'web_search',
                  description: 'Search the web for information from the past 24 hours only',
                  parameters: {
                    type: 'object',
                    properties: {
                      query: {
                        type: 'string',
                        description: 'The search query focused on recent developments'
                      },
                      time_filter: {
                        type: 'string',
                        description: 'Time range filter for search results',
                        enum: ['day'],
                        default: 'day'
                      }
                    },
                    required: ['query']
                  }
                }
              }
            ]
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Lovable AI API error for ${agent.name}:`, response.status, errorText);
          continue;
        }

        const data = await response.json();
        const briefContent = data.choices?.[0]?.message?.content;

        if (!briefContent) {
          console.error(`No content generated for ${agent.name}`);
          continue;
        }

        // Extract sources if available from tool calls
        const sources: any[] = [];
        const toolCalls = data.choices?.[0]?.message?.tool_calls;
        if (toolCalls && Array.isArray(toolCalls)) {
          for (const toolCall of toolCalls) {
            if (toolCall.function?.name === 'web_search') {
              try {
                const args = JSON.parse(toolCall.function.arguments);
                sources.push({ query: args.query });
              } catch (e) {
                console.error('Error parsing tool call:', e);
              }
            }
          }
        }

        // Store the brief in the database
        const { error: insertError } = await supabaseClient
          .from('daily_briefs')
          .insert({
            advisor_id: agent.id,
            topic: agent.description,
            brief_content: briefContent,
            sources: sources,
            scheduled_time: agent.welcome_message,
            read: false
          });

        if (insertError) {
          console.error(`Error inserting brief for ${agent.name}:`, insertError);
          continue;
        }

        briefsGenerated++;
        console.log(`Successfully generated brief for ${agent.name}`);
      } catch (error) {
        console.error(`Error processing agent ${agent.name}:`, error);
        continue;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Generated ${briefsGenerated} brief(s)`,
        processed: agents.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-daily-brief function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
