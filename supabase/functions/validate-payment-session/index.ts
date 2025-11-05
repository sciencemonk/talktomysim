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
  walletAddress: z.string().min(26).max(100)
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse and validate input
    const rawBody = await req.json();
    const { sessionId, walletAddress } = requestSchema.parse(rawBody);

    console.log('Validating payment session:', { sessionId, walletAddress });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Use the database function to validate session
    const { data, error } = await supabase
      .rpc('validate_payment_session', {
        p_session_id: sessionId,
        p_wallet_address: walletAddress
      });

    if (error) {
      console.error('Validation error:', error);
      throw new Error(`Failed to validate session: ${error.message}`);
    }

    const isValid = data === true;

    console.log('Session validation result:', isValid);

    return new Response(
      JSON.stringify({ 
        valid: isValid,
        sessionId: sessionId
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );

  } catch (error) {
    console.error('Error in validate-payment-session:', error);
    
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
        valid: false,
        error: error.message || 'Internal server error'
      }),
      {
        status: 200, // Return 200 but valid: false for failed validation
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
