import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ConfirmPurchaseRequest {
  purchaseId: string;
  transactionSignature: string;
  buyerWallet: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { purchaseId, transactionSignature, buyerWallet }: ConfirmPurchaseRequest = await req.json();

    console.log('Confirm NFT purchase:', { purchaseId, transactionSignature, buyerWallet });

    // Get the purchase record
    const { data: purchase, error: purchaseError } = await supabase
      .from('nft_purchases')
      .select('*')
      .eq('id', purchaseId)
      .single();

    if (purchaseError || !purchase) {
      console.error('Purchase not found:', purchaseError);
      return new Response(
        JSON.stringify({ success: false, error: 'Purchase not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Verify the transaction on Solana blockchain
    const heliusApiKey = Deno.env.get('HELIUS_API_KEY');
    if (!heliusApiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Helius API key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    try {
      const heliusUrl = `https://mainnet.helius-rpc.com/?api-key=${heliusApiKey}`;
      const txResponse = await fetch(heliusUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'transaction-check',
          method: 'getTransaction',
          params: [
            transactionSignature,
            { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0 }
          ],
        }),
      });

      const txData = await txResponse.json();
      console.log('Transaction data:', txData);

      if (!txData.result) {
        return new Response(
          JSON.stringify({ success: false, error: 'Transaction not found on blockchain' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      // Update purchase status to completed
      const { error: updateError } = await supabase
        .from('nft_purchases')
        .update({
          status: 'completed',
          transaction_signature: transactionSignature,
          completed_at: new Date().toISOString(),
        })
        .eq('id', purchaseId);

      if (updateError) {
        console.error('Error updating purchase:', updateError);
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to update purchase status' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      // Update NFT ownership in advisors table
      const { error: nftUpdateError } = await supabase
        .from('advisors')
        .update({
          crypto_wallet: buyerWallet,
          price: null, // Remove from sale
          updated_at: new Date().toISOString(),
        })
        .eq('id', purchase.nft_id);

      if (nftUpdateError) {
        console.error('Error updating NFT ownership:', nftUpdateError);
        // Continue anyway - purchase is recorded
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Purchase confirmed successfully',
          transactionSignature,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (error) {
      console.error('Error verifying transaction:', error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to verify transaction on blockchain' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in confirm-nft-purchase function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
