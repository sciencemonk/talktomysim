
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { content, title } = await req.json();
    
    if (!content) {
      throw new Error('Content is required');
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = `You are an expert document analyzer and tagger. Your task is to analyze documents and generate relevant tags, categories, and suggest improvements.

Categories to consider:
- Technology, Business, Science, Health, Education, Finance, Legal, Marketing, Research, Documentation, Policy, Training, Manual, Report, Analysis

Your response should be in JSON format with:
{
  "tags": ["tag1", "tag2", ...],
  "categories": ["category1", "category2", ...],
  "confidence": 0.85,
  "suggestedTitle": "Better Title (optional)"
}`;

    const userPrompt = `Please analyze this document and provide tags, categories, and a confidence score.

${title ? `Current Title: ${title}` : ''}

Document Content:
${content.substring(0, 3000)}${content.length > 3000 ? '...' : ''}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 500,
        temperature: 0.2
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${errorText}`);
    }

    const data = await response.json();
    const result = data.choices[0].message.content;

    // Try to parse JSON response
    let parsedResult;
    try {
      parsedResult = JSON.parse(result);
    } catch {
      // Fallback parsing if JSON is malformed
      const tags = extractFromText(result, ['tags:', 'keywords:']);
      const categories = extractFromText(result, ['categories:', 'category:']);
      
      parsedResult = {
        tags: tags.slice(0, 10),
        categories: categories.slice(0, 3),
        confidence: 0.7
      };
    }

    // Ensure arrays and reasonable limits
    const finalResult = {
      tags: Array.isArray(parsedResult.tags) ? parsedResult.tags.slice(0, 10) : [],
      categories: Array.isArray(parsedResult.categories) ? parsedResult.categories.slice(0, 3) : [],
      confidence: typeof parsedResult.confidence === 'number' ? 
        Math.min(Math.max(parsedResult.confidence, 0), 1) : 0.7,
      suggestedTitle: parsedResult.suggestedTitle || undefined
    };

    return new Response(
      JSON.stringify(finalResult),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in auto-tag-document:', error);
    return new Response(
      JSON.stringify({ 
        tags: [], 
        categories: [], 
        confidence: 0,
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function extractFromText(text: string, indicators: string[]): string[] {
  const results: string[] = [];
  
  for (const indicator of indicators) {
    const index = text.toLowerCase().indexOf(indicator.toLowerCase());
    if (index !== -1) {
      const afterIndicator = text.substring(index + indicator.length);
      const lines = afterIndicator.split('\n');
      
      for (const line of lines) {
        if (line.trim()) {
          const items = line.split(/[,;]/).map(item => 
            item.trim().replace(/^[-*\d.]\s*/, '').replace(/["\[\]]/g, '')
          ).filter(item => item.length > 0);
          
          results.push(...items);
          if (results.length >= 10) break;
        }
        if (!line.trim()) break; // Stop at empty line
      }
    }
  }
  
  return [...new Set(results)]; // Remove duplicates
}
