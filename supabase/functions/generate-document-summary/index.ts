
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
    const { documentId, content, summaryType } = await req.json();
    
    if (!content) {
      throw new Error('Content is required');
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Determine the prompt based on summary type
    let systemPrompt = '';
    let userPrompt = '';

    switch (summaryType) {
      case 'extractive':
        systemPrompt = 'You are an expert at extractive summarization. Extract the most important sentences from the text to create a concise summary.';
        userPrompt = `Please create an extractive summary of the following text by selecting the most important sentences. Also provide 3-5 key points and relevant tags:\n\n${content}`;
        break;
      
      case 'abstractive':
        systemPrompt = 'You are an expert at abstractive summarization. Create a concise, coherent summary by rephrasing and condensing the main ideas.';
        userPrompt = `Please create an abstractive summary of the following text by rephrasing and condensing the main ideas. Also provide 3-5 key points and relevant tags:\n\n${content}`;
        break;
      
      default: // auto
        systemPrompt = 'You are an expert document analyzer. Create a comprehensive summary with key points and tags.';
        userPrompt = `Please analyze the following text and provide:
1. A concise summary (2-3 paragraphs)
2. 3-5 key points
3. Relevant tags/keywords
4. A confidence score (0-1) for the summary quality

Text to analyze:\n\n${content}`;
    }

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
        max_tokens: 1000,
        temperature: 0.3
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${errorText}`);
    }

    const data = await response.json();
    const result = data.choices[0].message.content;

    // Parse the structured response
    const lines = result.split('\n').filter((line: string) => line.trim());
    let summary = '';
    let keyPoints: string[] = [];
    let tags: string[] = [];
    let confidence = 0.8;

    let currentSection = '';
    for (const line of lines) {
      if (line.toLowerCase().includes('summary') || line.toLowerCase().includes('overview')) {
        currentSection = 'summary';
        continue;
      } else if (line.toLowerCase().includes('key points') || line.toLowerCase().includes('main points')) {
        currentSection = 'keyPoints';
        continue;
      } else if (line.toLowerCase().includes('tags') || line.toLowerCase().includes('keywords')) {
        currentSection = 'tags';
        continue;
      } else if (line.toLowerCase().includes('confidence')) {
        const match = line.match(/(\d+\.?\d*)/);
        if (match) {
          confidence = parseFloat(match[1]);
          if (confidence > 1) confidence = confidence / 100; // Convert percentage
        }
        continue;
      }

      if (currentSection === 'summary' && line.trim() && !line.startsWith('-') && !line.match(/^\d+\./)) {
        summary += (summary ? ' ' : '') + line.trim();
      } else if (currentSection === 'keyPoints' && (line.startsWith('-') || line.match(/^\d+\./))) {
        keyPoints.push(line.replace(/^[-\d.]\s*/, '').trim());
      } else if (currentSection === 'tags' && line.trim()) {
        const lineTags = line.replace(/^[-\d.]\s*/, '').split(/[,;]/).map(t => t.trim()).filter(t => t);
        tags.push(...lineTags);
      }
    }

    // Fallback: if parsing failed, use the entire result as summary
    if (!summary) {
      summary = result;
    }

    return new Response(
      JSON.stringify({
        id: crypto.randomUUID(),
        summary: summary.trim(),
        keyPoints: keyPoints.slice(0, 5),
        tags: tags.slice(0, 10),
        confidence: Math.min(Math.max(confidence, 0), 1)
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in generate-document-summary:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
