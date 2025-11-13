import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, storeId }: { messages: ChatMessage[], storeId: string } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    
    if (!lovableApiKey) {
      throw new Error('Missing LOVABLE_API_KEY');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Fetch store details
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('*')
      .eq('id', storeId)
      .single();
    
    if (storeError) {
      console.error('Error fetching store:', storeError);
      throw new Error('Store not found');
    }
    
    // Fetch active products for this store
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('store_id', storeId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (productsError) {
      console.error('Error fetching products:', productsError);
    }
    
    // Build product catalog context
    let productContext = '';
    if (products && products.length > 0) {
      productContext = '\n\nAVAILABLE PRODUCTS:\n' + products.map((p: any) => 
        `- ${p.title} ($${p.price} ${p.currency || 'USD'}): ${p.description}${p.delivery_info ? ` | Delivery: ${p.delivery_info}` : ''}`
      ).join('\n');
    } else {
      productContext = '\n\nNote: No products are currently available in the catalog.';
    }
    
    // Build system prompt
    const systemPrompt = `You are an AI shopping assistant for ${store.store_name || 'this store'}.

STORE DESCRIPTION:
${store.store_description || 'An online store'}

YOUR ROLE:
You help customers discover products, answer questions about items, make personalized recommendations, and guide them through their shopping journey.

INTERACTION STYLE: ${store.interaction_style || 'Friendly and helpful'}
RESPONSE TONE: ${store.response_tone || 'Professional'}
PRIMARY FOCUS: ${store.primary_focus || 'Customer satisfaction'}

${productContext}

GUIDELINES:
- Be helpful and guide customers toward products that match their needs
- Provide detailed information about products when asked
- Make personalized recommendations based on customer preferences
- Be honest if a product isn't available
- Keep responses conversational and engaging
- Focus on understanding customer needs first before recommending products`;

    console.log('System prompt:', systemPrompt);
    console.log('Messages:', messages);

    // Call Lovable AI Gateway with streaming
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), 
          { 
            status: 429, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI service requires payment. Please contact support.' }), 
          { 
            status: 402, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    // Stream the response back to the client
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
      },
    });

  } catch (error) {
    console.error('Error in store-agent-chat:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
