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

    console.log('Signature valid, authenticating user...');

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
      console.log('Creating new user for wallet:', publicKey);
      
      // Create new user with a random password (won't be used)
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
      } catch (createError: any) {
        // If user already exists but profile doesn't, get the user by email
        if (createError.code === 'email_exists' || createError.status === 422) {
          console.log('User already exists, fetching by email...');
          const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
          const existingUser = users.find(u => u.email === userEmail);
          
          if (!existingUser) {
            throw new Error('User creation failed and cannot find existing user');
          }
          
          userId = existingUser.id;
          console.log('Found existing user:', userId);
          
          // Create profile if it doesn't exist
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
      console.log('Existing profile found:', existingProfile.id);
      userId = existingProfile.id;
    }

    console.log('Generating session tokens...');

    // Generate a recovery link which includes session tokens
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: userEmail,
    });

    if (linkError) {
      console.error('Error generating link:', linkError);
      throw linkError;
    }

    // Extract the tokens from the verification URL
    const url = new URL(linkData.properties.action_link);
    const accessToken = url.searchParams.get('access_token');
    const refreshToken = url.searchParams.get('refresh_token');

    if (!accessToken || !refreshToken) {
      throw new Error('Failed to generate session tokens');
    }

    console.log('Session tokens generated successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        access_token: accessToken,
        refresh_token: refreshToken,
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
