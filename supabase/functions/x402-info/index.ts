import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-402-payment',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const simId = url.searchParams.get('simId');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch sim details if simId provided
    let sim = null;
    let payTo = Deno.env.get('DEFAULT_WALLET_ADDRESS') || '';
    let price = 5.0; // Default price
    let description = 'Chat with AI agent';

    if (simId) {
      const { data } = await supabase
        .from('advisors')
        .select('name, short_description, x402_price, x402_wallet_address')
        .eq('id', simId)
        .single();

      if (data) {
        sim = data;
        description = `Chat with ${data.name}: ${data.short_description || 'AI-powered conversation'}`;
        price = data.x402_price || 5.0;
        payTo = data.x402_wallet_address || payTo;
      }
    }

    const x402Response = {
      x402Version: 1,
      accepts: [
        {
          scheme: "exact",
          network: "base",
          maxAmountRequired: price.toString(),
          resource: simId ? `/api/chat/${simId}` : '/api/chat',
          description: description,
          mimeType: "application/json",
          payTo: payTo,
          maxTimeoutSeconds: 86400, // 24 hours
          asset: "USDC",
          outputSchema: {
            input: {
              type: "http",
              method: "POST",
              bodyType: "json",
              bodyFields: {
                message: {
                  type: "string",
                  required: true,
                  description: "The message to send to the AI agent"
                },
                conversationId: {
                  type: "string",
                  required: false,
                  description: "Optional conversation ID to continue an existing chat"
                }
              },
              headerFields: {
                "x-402-payment": {
                  type: "string",
                  required: true,
                  description: "Payment proof from x402 transaction"
                }
              }
            },
            output: {
              type: "object",
              properties: {
                response: {
                  type: "string",
                  description: "AI agent's response message"
                },
                conversationId: {
                  type: "string",
                  description: "Conversation ID for tracking the chat session"
                }
              }
            }
          },
          extra: {
            simId: simId,
            simName: sim?.name,
            accessDuration: "24 hours",
            network: "base-mainnet",
            tokenAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
          }
        }
      ]
    };

    return new Response(
      JSON.stringify(x402Response),
      {
        status: 402,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (error) {
    console.error('Error in x402-info:', error);
    return new Response(
      JSON.stringify({
        x402Version: 1,
        error: error.message
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  }
});
