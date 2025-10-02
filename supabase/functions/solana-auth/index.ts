import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';
import nacl from 'https://esm.sh/tweetnacl@1.0.3';
import bs58 from 'https://esm.sh/bs58@5.0.0';

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

    console.log('Solana auth request:', { publicKey, hasSignature: !!signature, hasMessage: !!message });

    if (!publicKey || !signature || !message) {
      throw new Error('Missing required fields');
    }

    // Verify the signature
    const messageBytes = new TextEncoder().encode(message);
    const signatureBytes = bs58.decode(signature);
    const publicKeyBytes = bs58.decode(publicKey);

    console.log('Verifying signature...');
    const isValid = nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      publicKeyBytes
    );

    if (!isValid) {
      console.error('Invalid signature');
      throw new Error('Invalid signature');
    }

    console.log('Signature valid, creating/finding user...');

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if user exists by wallet address
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('wallet_address', publicKey)
      .single();

    let userId = existingProfile?.id;

    if (!userId) {
      console.log('Creating new user for wallet:', publicKey);
      
      // Create new user
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: `${publicKey}@solana.wallet`,
        email_confirm: true,
        user_metadata: {
          wallet_address: publicKey,
          auth_method: 'solana',
        },
      });

      if (authError) {
        console.error('Error creating user:', authError);
        throw authError;
      }
      
      userId = authData.user.id;
      console.log('User created:', userId);

      // Create profile
      const { error: profileError } = await supabaseAdmin.from('profiles').insert({
        id: userId,
        wallet_address: publicKey,
        username: `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`,
        passcode: '0000',
      });

      if (profileError) {
        console.error('Error creating profile:', profileError);
      }
    }

    console.log('Generating session token...');

    // Generate a session for the user
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: `${publicKey}@solana.wallet`,
    });

    if (sessionError) {
      console.error('Error generating session:', sessionError);
      throw sessionError;
    }

    console.log('Session created successfully');

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
