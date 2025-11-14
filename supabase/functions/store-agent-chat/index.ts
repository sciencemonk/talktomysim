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
    const { conversationHistory, storeId, message, products: clientProducts } = await req.json();
    const messages: ChatMessage[] = conversationHistory || [];
    
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
    
    // Build system prompt with product ID mapping
    let productIdMapping = '';
    if (products && products.length > 0) {
      productIdMapping = '\n\nPRODUCT IDs (use these exact IDs with show_product tool):\n' + 
        products.map((p: any) => `- "${p.title}": ${p.id}`).join('\n');
    }
    
    // Track which products have been shown in this conversation
    const shownProductIds = new Set<string>();
    for (const msg of messages) {
      if (msg.role === 'assistant' && typeof msg.content === 'string') {
        // Check if message contains product ID references
        const matches = msg.content.match(/product_id":\s*"([^"]+)"/g);
        if (matches) {
          matches.forEach(match => {
            const id = match.match(/"([^"]+)"/)?.[1];
            if (id) shownProductIds.add(id);
          });
        }
      }
    }

    const systemPrompt = `You are an AI shopping assistant for ${store.store_name || 'this store'}.

STORE DESCRIPTION:
${store.store_description || 'An online store'}

YOUR ROLE:
You help customers discover products, answer questions about items, make personalized recommendations, and guide them through their shopping journey.

INTERACTION STYLE: ${store.interaction_style || 'Friendly and helpful'}
RESPONSE TONE: ${store.response_tone || 'Professional'}
PRIMARY FOCUS: ${store.primary_focus || 'Customer satisfaction'}

${productContext}${productIdMapping}

${shownProductIds.size > 0 ? `\nPRODUCTS ALREADY SHOWN: ${Array.from(shownProductIds).map(id => products?.find((p: any) => p.id === id)?.title || id).join(', ')}` : ''}

CRITICAL GUIDELINES FOR PRODUCT TOOL:
- Use show_product tool ONLY when FIRST introducing a NEW product to the customer
- NEVER re-show products that are already in PRODUCTS ALREADY SHOWN list above
- After showing a product with the tool, continue conversation with NORMAL TEXT - do NOT use the tool again for that product
- Answer follow-up questions about already-shown products using text only
- If customer asks general questions, chat normally - you don't need to show products for every response
- When customer asks for "other" or "different" products, show NEW products that haven't been shown yet
- Use exact product IDs from the list above when calling show_product
- If all products are shown and customer wants more, politely explain you've shown everything
- Balance being helpful with natural conversation - not every message needs a product card`;

    console.log('System prompt:', systemPrompt);
    console.log('Messages:', messages);

    // Define tools for product recommendations
    const tools = products && products.length > 0 ? [
      {
        type: "function",
        function: {
          name: "show_product",
          description: "Display a product card with details, image, and purchase button to the customer",
          parameters: {
            type: "object",
            properties: {
              product_id: {
                type: "string",
                description: "The ID of the product to display"
              }
            },
            required: ["product_id"]
          }
        }
      }
    ] : undefined;

    // Call Lovable AI Gateway with streaming
    const requestBody: any = {
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      stream: true,
      tool_choice: "auto", // Encourage tool usage
    };

    if (tools) {
      requestBody.tools = tools;
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
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
