import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const requestSchema = z.object({
  sessionId: z.string().min(10).max(200),
  agentId: z.string().uuid().optional(),
  walletAddress: z.string().min(26).max(100),
  signature: z.string().min(50).max(200),
  amount: z.number().positive().max(10000),
  currency: z.string().max(10).default('USDC'),
  network: z.string().max(50).default('base'),
  expiresInHours: z.number().positive().max(720).default(24) // Max 30 days
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse and validate input
    const rawBody = await req.json();
    const validatedInput = requestSchema.parse(rawBody);
    
    const { 
      sessionId, 
      agentId, 
      walletAddress, 
      signature, 
      amount, 
      currency, 
      network,
      expiresInHours 
    } = validatedInput;

    console.log('Storing payment session:', { sessionId, walletAddress, amount });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Calculate expiration time
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresInHours);

    // Store payment session in database
    const { data, error } = await supabase
      .from('payment_sessions')
      .insert({
        session_id: sessionId,
        agent_id: agentId,
        wallet_address: walletAddress,
        payment_signature: signature,
        amount: amount,
        currency: currency,
        network: network,
        expires_at: expiresAt.toISOString(),
        is_active: true,
        metadata: {
          created_via: 'store-payment-session',
          user_agent: req.headers.get('user-agent'),
          timestamp: new Date().toISOString()
        }
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw new Error(`Failed to store payment session: ${error.message}`);
    }

    console.log('Payment session stored successfully:', data.id);

    return new Response(
      JSON.stringify({ 
        success: true,
        sessionId: data.session_id,
        expiresAt: data.expires_at
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );

  } catch (error) {
    console.error('Error in store-payment-session:', error);
    
    // Handle validation errors specifically
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid input',
          details: error.errors
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
