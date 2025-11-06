import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-402-payment, accept',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

interface X402PaymentProof {
  transactionHash: string;
  network: string;
  amount: string;
  currency: string;
  from: string;
  to: string;
  timestamp: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    
    // Extract offeringId from path: /x402-purchase/{offeringId}
    const offeringId = pathParts[pathParts.length - 1];

    console.log('[x402-purchase] Request:', {
      method: req.method,
      offeringId,
      headers: {
        payment: req.headers.get('x-402-payment') ? 'present' : 'missing',
        contentType: req.headers.get('content-type')
      }
    });

    // Validate x402 payment header
    const paymentHeader = req.headers.get('x-402-payment');
    if (!paymentHeader) {
      console.log('[x402-purchase] Missing x-402-payment header');
      return new Response(
        JSON.stringify({
          x402Version: 1,
          error: 'Payment required',
          message: 'x-402-payment header is required'
        }),
        {
          status: 402,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        },
      );
    }

    // Parse payment proof
    let paymentProof: X402PaymentProof;
    try {
      paymentProof = JSON.parse(paymentHeader);
      console.log('[x402-purchase] Payment proof received:', {
        hash: paymentProof.transactionHash,
        amount: paymentProof.amount,
        network: paymentProof.network
      });
    } catch (error) {
      console.log('[x402-purchase] Invalid payment proof format:', error);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid payment proof format'
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        },
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch offering details
    const { data: offering, error: offeringError } = await supabase
      .from('x_agent_offerings')
      .select(`
        *,
        agent:advisors!agent_id(
          id,
          name,
          x402_wallet
        )
      `)
      .eq('id', offeringId)
      .eq('is_active', true)
      .single();

    if (offeringError || !offering) {
      console.log('[x402-purchase] Offering not found:', offeringError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Offering not found or inactive'
        }),
        {
          status: 404,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        },
      );
    }

    const agent = offering.agent as any;
    const expectedPayTo = agent?.x402_wallet || Deno.env.get('DEFAULT_WALLET_ADDRESS') || '';
    const expectedAmount = Number(offering.price);

    // Validate payment details
    if (paymentProof.network.toLowerCase() !== 'base') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid network. Expected base network.'
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        },
      );
    }

    if (Number(paymentProof.amount) < expectedAmount) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Insufficient payment. Expected ${expectedAmount} USDC, received ${paymentProof.amount} USDC`
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        },
      );
    }

    if (paymentProof.to.toLowerCase() !== expectedPayTo.toLowerCase()) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Payment sent to incorrect address'
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        },
      );
    }

    // Check if transaction was already processed
    const { data: existingPurchase } = await supabase
      .from('x_agent_purchases')
      .select('id')
      .eq('transaction_signature', paymentProof.transactionHash)
      .single();

    if (existingPurchase) {
      console.log('[x402-purchase] Transaction already processed:', paymentProof.transactionHash);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Transaction already processed'
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        },
      );
    }

    // Parse request body for buyer info
    let buyerInfo: Record<string, any> = {};
    if (req.method === 'POST' && req.headers.get('content-type')?.includes('application/json')) {
      try {
        buyerInfo = await req.json();
      } catch (error) {
        console.log('[x402-purchase] No buyer info provided or invalid JSON');
      }
    }

    // Record the purchase
    const purchaseId = crypto.randomUUID();
    const { error: insertError } = await supabase
      .from('x_agent_purchases')
      .insert({
        id: purchaseId,
        offering_id: offeringId,
        agent_id: offering.agent_id,
        buyer_wallet: paymentProof.from,
        amount_paid: Number(paymentProof.amount),
        transaction_signature: paymentProof.transactionHash,
        payment_network: paymentProof.network,
        buyer_info: buyerInfo,
        status: 'completed',
        payment_method: 'x402'
      });

    if (insertError) {
      console.error('[x402-purchase] Failed to record purchase:', insertError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to process purchase'
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

    console.log('[x402-purchase] Purchase successful:', {
      purchaseId,
      offeringId,
      transactionHash: paymentProof.transactionHash
    });

    // Build response based on offering type
    let responseData: any = {
      success: true,
      purchaseId: purchaseId,
      message: 'Purchase completed successfully',
      offeringTitle: offering.title,
      offeringType: offering.offering_type
    };

    // Add delivery information based on offering type
    if (offering.offering_type === 'digital_file' && offering.digital_file_url) {
      responseData.deliveryUrl = offering.digital_file_url;
      responseData.deliveryMethod = 'download';
    } else if (offering.offering_type === 'agent') {
      responseData.agentId = offering.agent_id;
      responseData.conversationsRemaining = offering.price_per_conversation 
        ? Math.floor(Number(paymentProof.amount) / offering.price_per_conversation)
        : 1;
      responseData.deliveryMethod = 'agent_access';
    } else {
      responseData.deliveryMethod = offering.delivery_method;
      responseData.instructions = `Your purchase is confirmed. The seller will contact you based on the delivery method: ${offering.delivery_method}`;
    }

    return new Response(
      JSON.stringify(responseData),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );

  } catch (error) {
    console.error('[x402-purchase] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
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
