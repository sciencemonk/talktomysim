import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';
import * as nacl from 'https://esm.sh/tweetnacl@1.0.3';
import * as bs58 from 'https://esm.sh/bs58@5.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { publicKey, signature, message } = await req.json();

    if (!publicKey || !signature || !message) {
      throw new Error('Missing required fields');
    }

    // Verify the signature
    const messageBytes = new TextEncoder().encode(message);
    const signatureBytes = bs58.default.decode(signature);
    const publicKeyBytes = bs58.default.decode(publicKey);

    const isValid = nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      publicKeyBytes
    );

    if (!isValid) {
      throw new Error('Invalid signature');
    }

    // Create Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if user exists
    const { data: existingUser } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('wallet_address', publicKey)
      .single();

    let userId = existingUser?.id;

    if (!userId) {
      // Create new user
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: `${publicKey}@solana.wallet`,
        email_confirm: true,
        user_metadata: {
          wallet_address: publicKey,
          auth_method: 'solana',
        },
      });

      if (authError) throw authError;
      userId = authData.user.id;

      // Create profile
      await supabaseAdmin.from('profiles').insert({
        id: userId,
        wallet_address: publicKey,
        username: `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`,
      });
    }

    // Generate session token
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: `${publicKey}@solana.wallet`,
    });

    if (sessionError) throw sessionError;

    return new Response(
      JSON.stringify({ 
        success: true,
        session: sessionData 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Solana auth error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
