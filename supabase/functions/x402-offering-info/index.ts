import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-402-payment, accept',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    let offeringId = url.searchParams.get('offeringId');

    console.log('[x402-offering-info] Request:', {
      method: req.method,
      url: req.url,
      referer: req.headers.get('referer'),
      userAgent: req.headers.get('user-agent'),
      offeringId
    });

    // If no offeringId in query params, try to extract from referrer
    if (!offeringId) {
      const referer = req.headers.get('referer');
      if (referer) {
        const refererUrl = new URL(referer);
        const pathParts = refererUrl.pathname.split('/');
        const offeringIndex = pathParts.indexOf('offering');
        if (offeringIndex !== -1 && pathParts[offeringIndex + 1]) {
          offeringId = pathParts[offeringIndex + 1];
          console.log('[x402-offering-info] Extracted offeringId from referer:', offeringId);
        }
      }
    }

    if (!offeringId) {
      console.log('[x402-offering-info] No offeringId found');
      return new Response(
        JSON.stringify({ 
          x402Version: 1, 
          error: 'offeringId parameter required' 
        }),
        { 
          status: 400, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
          } 
        }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch offering with agent details
    const { data: offering, error } = await supabase
      .from('x_agent_offerings')
      .select(`
        *,
        agent:advisors!agent_id(
          id,
          name,
          avatar_url,
          social_links,
          x402_wallet
        )
      `)
      .eq('id', offeringId)
      .eq('is_active', true)
      .single();

    if (error || !offering) {
      console.log('[x402-offering-info] Offering not found:', error);
      return new Response(
        JSON.stringify({ 
          x402Version: 1, 
          error: 'Offering not found or inactive' 
        }),
        { 
          status: 404, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
          } 
        }
      );
    }

    const agent = offering.agent as any;
    const payTo = agent?.x402_wallet || Deno.env.get('DEFAULT_WALLET_ADDRESS') || '';
    const price = Number(offering.price) || 0;

    console.log('[x402-offering-info] Offering found:', {
      id: offering.id,
      title: offering.title,
      price,
      payTo
    });

    // Build required info fields for outputSchema
    const bodyFields: Record<string, any> = {};
    if (offering.required_info && Array.isArray(offering.required_info)) {
      offering.required_info.forEach((field: any) => {
        bodyFields[field.name] = {
          type: field.type || "string",
          required: field.required !== false,
          description: field.label || field.name
        };
      });
    }

    const x402Response = {
      x402Version: 1,
      accepts: [
        {
          scheme: "exact" as const,
          network: "base" as const,
          maxAmountRequired: price.toString(),
          resource: `/api/purchase/${offeringId}`,
          description: `${offering.title}: ${offering.description || ''}`.trim(),
          mimeType: "application/json",
          payTo: payTo,
          maxTimeoutSeconds: 86400,
          asset: "USDC",
          outputSchema: {
            input: {
              type: "http" as const,
              method: "POST" as const,
              bodyType: "json" as const,
              bodyFields: Object.keys(bodyFields).length > 0 ? bodyFields : undefined,
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
                success: {
                  type: "boolean",
                  description: "Whether the purchase was successful"
                },
                purchaseId: {
                  type: "string",
                  description: "Unique purchase identifier"
                },
                message: {
                  type: "string",
                  description: "Status message"
                }
              }
            }
          },
          extra: {
            offeringId: offeringId,
            offeringTitle: offering.title,
            offeringType: offering.offering_type,
            deliveryMethod: offering.delivery_method,
            agentName: agent?.name,
            agentId: agent?.id,
            network: "base-mainnet",
            tokenAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
          }
        }
      ]
    };

    console.log('[x402-offering-info] Returning 402 response');

    return new Response(
      JSON.stringify(x402Response, null, 2),
      {
        status: 402,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (error) {
    console.error('[x402-offering-info] Error:', error);
    return new Response(
      JSON.stringify({
        x402Version: 1,
        error: error.message || 'Internal server error'
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
