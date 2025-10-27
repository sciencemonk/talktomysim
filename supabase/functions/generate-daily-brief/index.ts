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

    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicApiKey) {
      throw new Error('ANTHROPIC_API_KEY not configured');
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

        // Generate web search query and brief using Claude
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': anthropicApiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-5',
            max_tokens: 4096,
            system: `You are an expert analyst who creates comprehensive daily briefs on specific topics. Your briefs MUST:

FORMATTING REQUIREMENTS:
- Use proper markdown with double line breaks between ALL paragraphs
- Use ## for main section headings (not bold text)
- Use ### for subsection headings
- Use **bold** for emphasis on key terms
- Add blank lines before and after all headings, lists, and sections

CONTENT REQUIREMENTS:
- Include 3-5 specific, recent news stories with sources
- Each news story should have: headline, key details, source name, and date
- Focus on developments from October 25, 2025
- Be 600-1000 words with detailed analysis
- Include an Executive Summary at the top
- End with "Key Takeaways" section with 3-4 bullet points

STRUCTURE:
## Executive Summary
[2-3 sentence overview]

## Breaking News & Recent Developments
[3-5 specific news stories with sources and dates]

## Industry Analysis
[Detailed analysis of trends and implications]

## Key Takeaways
- [Bullet point 1]
- [Bullet point 2]
- [Bullet point 3]`,
            messages: [
              {
                role: 'user',
                content: `Create a comprehensive daily brief on the following topic: "${agent.description}"

CRITICAL INSTRUCTIONS:
1. Use the web_search tool 5-8 times with different queries to find recent news stories
2. Search specifically for news from October 25, 2025 and the past 24 hours
3. Find at least 3-5 specific news articles/stories with sources
4. Include dates, publication names, and specific details from each story

SEARCH STRATEGY:
- Search 1: "[topic] news October 2025"
- Search 2: "[topic] latest developments today"
- Search 3: "[topic] industry analysis October 2025"
- Search 4: "[topic] breaking news"
- Additional searches for specific angles

FORMAT REQUIREMENTS:
- Use double line breaks between ALL paragraphs (two \n\n)
- Use ## for main section headings
- Use ### for subsections
- Each news story must include: Headline, Date, Source, Key Details

REQUIRED SECTIONS:
## Executive Summary

## Breaking News & Recent Developments
### [News Story 1 Headline]
**Source:** [Publication Name] | **Date:** October 25, 2025
[Details about the story]

### [News Story 2 Headline]
**Source:** [Publication Name] | **Date:** October 25, 2025
[Details]

[Continue with more stories]

## Industry Analysis & Implications

## Key Takeaways
- [Takeaway 1]
- [Takeaway 2]
- [Takeaway 3]

Be comprehensive, cite all sources, and ensure proper spacing for readability.`
              }
            ],
            tools: [
              {
                name: 'web_search',
                description: 'Search the web for current information. Use this tool multiple times with different queries to gather comprehensive information.',
                input_schema: {
                  type: 'object',
                  properties: {
                    query: {
                      type: 'string',
                      description: 'The search query to find relevant information'
                    }
                  },
                  required: ['query']
                }
              }
            ]
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Anthropic API error for ${agent.name}:`, response.status, errorText);
          continue;
        }

        const data = await response.json();
        console.log(`Claude response for ${agent.name}:`, JSON.stringify(data, null, 2));

        // Extract content from Claude's response format
        let briefContent = '';
        const sources: any[] = [];

        // Claude may return content in blocks
        if (data.content && Array.isArray(data.content)) {
          for (const block of data.content) {
            if (block.type === 'text') {
              briefContent += block.text;
            } else if (block.type === 'tool_use' && block.name === 'web_search') {
              // Track search queries used
              sources.push({ 
                query: block.input?.query || 'web search',
                tool_use_id: block.id 
              });
            }
          }
        }

        if (!briefContent) {
          console.error(`No content generated for ${agent.name}`, data);
          continue;
        }

        console.log(`Generated brief content length: ${briefContent.length} characters`);
        console.log(`Sources tracked: ${sources.length}`);

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
