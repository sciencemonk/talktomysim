import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PurchaseRequest {
  nftId: string;
  buyerWallet: string;
  sellerWallet: string;
  price: number;
  mintAddress: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { nftId, buyerWallet, sellerWallet, price, mintAddress }: PurchaseRequest = await req.json();

    console.log('Purchase NFT request:', { nftId, buyerWallet, sellerWallet, price, mintAddress });

    // Verify NFT exists and is for sale
    const { data: nft, error: nftError } = await supabase
      .from('advisors')
      .select('*')
      .eq('id', nftId)
      .eq('marketplace_category', 'nft')
      .single();

    if (nftError || !nft) {
      console.error('NFT not found:', nftError);
      return new Response(
        JSON.stringify({ success: false, error: 'NFT not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    if (!nft.price || nft.price <= 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'NFT is not for sale' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    if (nft.price !== price) {
      return new Response(
        JSON.stringify({ success: false, error: 'Price mismatch' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Verify the seller still owns the NFT by checking the crypto_wallet matches
    const expectedSeller = nft.crypto_wallet;
    if (expectedSeller !== sellerWallet) {
      return new Response(
        JSON.stringify({ success: false, error: 'Seller wallet mismatch' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Use Helius API to verify NFT ownership on-chain
    const heliusApiKey = Deno.env.get('HELIUS_API_KEY');
    if (heliusApiKey) {
      try {
        const heliusUrl = `https://mainnet.helius-rpc.com/?api-key=${heliusApiKey}`;
        const ownershipResponse = await fetch(heliusUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 'nft-ownership',
            method: 'getAsset',
            params: { id: mintAddress },
          }),
        });

        const ownershipData = await ownershipResponse.json();
        console.log('NFT ownership data:', ownershipData);

        // Check if the current owner matches the seller
        const currentOwner = ownershipData?.result?.ownership?.owner;
        if (currentOwner && currentOwner !== sellerWallet) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'NFT is no longer owned by seller',
              currentOwner 
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }
      } catch (heliusError) {
        console.error('Helius verification error:', heliusError);
        // Continue anyway - this is a nice-to-have verification
      }
    }

    // Create a purchase record
    const { data: purchase, error: purchaseError } = await supabase
      .from('nft_purchases')
      .insert({
        nft_id: nftId,
        buyer_wallet: buyerWallet,
        seller_wallet: sellerWallet,
        price: price,
        mint_address: mintAddress,
        status: 'pending',
      })
      .select()
      .single();

    if (purchaseError) {
      console.error('Error creating purchase record:', purchaseError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to create purchase record' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log('Purchase record created:', purchase);

    // Return purchase details for frontend to complete the transaction
    return new Response(
      JSON.stringify({
        success: true,
        purchaseId: purchase.id,
        sellerWallet,
        price,
        mintAddress,
        message: 'Purchase initialized. Please complete the transaction in your wallet.',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in purchase-nft function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
