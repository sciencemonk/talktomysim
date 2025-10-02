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

    console.log('Solana auth request:', { publicKey });

    if (!publicKey || !signature || !message) {
      throw new Error('Missing required fields');
    }

    // Verify the signature
    const messageBytes = new TextEncoder().encode(message);
    const signatureBytes = bs58.decode(signature);
    const publicKeyBytes = bs58.decode(publicKey);

    const isValid = nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      publicKeyBytes
    );

    if (!isValid) {
      throw new Error('Invalid signature');
    }

    console.log('Signature valid');

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const userEmail = `${publicKey}@solana.wallet`;

    // Check if profile exists with this wallet address
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('wallet_address', publicKey)
      .single();

    let userId: string;

    if (!existingProfile) {
      console.log('Creating new user');
      
      const tempPassword = crypto.randomUUID();
      
      try {
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: userEmail,
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            wallet_address: publicKey,
            auth_method: 'solana',
          },
        });

        if (authError) throw authError;
        
        userId = authData.user.id;

        await supabaseAdmin.from('profiles').insert({
          id: userId,
          wallet_address: publicKey,
          username: `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`,
          passcode: '0000',
        });
      } catch (createError: any) {
        if (createError.code === 'email_exists' || createError.status === 422) {
          const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
          const existingUser = users.find(u => u.email === userEmail);
          
          if (!existingUser) {
            throw new Error('User creation failed');
          }
          
          userId = existingUser.id;
          
          await supabaseAdmin.from('profiles').upsert({
            id: userId,
            wallet_address: publicKey,
            username: `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`,
            passcode: '0000',
          }, { onConflict: 'id' });
        } else {
          throw createError;
        }
      }
    } else {
      userId = existingProfile.id;
    }

    console.log('Generating tokens for user:', userId);

    // Generate magic link which contains session tokens
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: userEmail,
    });

    if (linkError) {
      console.error('Error generating link:', linkError);
      throw linkError;
    }

    // The hashed_token from the link is what we need
    const hashedToken = linkData.properties.hashed_token;
    
    if (!hashedToken) {
      throw new Error('No token in magic link');
    }

    // Verify the OTP to get session tokens
    const { data: sessionData, error: verifyError } = await supabaseAdmin.auth.verifyOtp({
      token_hash: hashedToken,
      type: 'magiclink',
    });

    if (verifyError) {
      console.error('Error verifying OTP:', verifyError);
      throw verifyError;
    }

    if (!sessionData?.session) {
      throw new Error('No session created');
    }

    console.log('Session created');

    return new Response(
      JSON.stringify({ 
        success: true,
        access_token: sessionData.session.access_token,
        refresh_token: sessionData.session.refresh_token,
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
