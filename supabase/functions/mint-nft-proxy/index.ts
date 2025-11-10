import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const heliusApiKey = Deno.env.get('HELIUS_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!heliusApiKey) {
      throw new Error('HELIUS_API_KEY not configured');
    }

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    const heliusRpc = `https://mainnet.helius-rpc.com/?api-key=${heliusApiKey}`;

    const { 
      operation,
      walletAddress,
      metadata,
      imageBase64,
      imageFileName,
      mintAddress,
    } = await req.json();

    console.log(`Processing ${operation} request`);

    // Handle complete NFT minting server-side using Metaplex
    if (operation === 'mint-nft') {
      // Upload image and metadata first
      const timestamp = Date.now();
      const imageFilePath = `nft-images/${walletAddress}/${timestamp}-${imageFileName}`;
      
      const imageBuffer = Uint8Array.from(atob(imageBase64), c => c.charCodeAt(0));
      
      const { error: imageError } = await supabase.storage
        .from('avatars')
        .upload(imageFilePath, imageBuffer, {
          contentType: 'image/png',
          cacheControl: '3600',
          upsert: false,
        });

      if (imageError) throw new Error('Failed to upload image: ' + imageError.message);

      const { data: { publicUrl: imageUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(imageFilePath);

      const completeMetadata = {
        name: metadata.name,
        symbol: metadata.symbol,
        description: metadata.description,
        image: imageUrl,
        attributes: metadata.attributes || [],
        properties: {
          files: [{ uri: imageUrl, type: 'image/png' }],
          category: 'image',
        },
        seller_fee_basis_points: metadata.sellerFeeBasisPoints || 0,
        creators: metadata.creators || [],
      };

      const metadataFilePath = `nft-metadata/${walletAddress}/${timestamp}-metadata.json`;
      const metadataBlob = new Blob([JSON.stringify(completeMetadata, null, 2)], {
        type: 'application/json',
      });

      const { error: metadataError } = await supabase.storage
        .from('avatars')
        .upload(metadataFilePath, metadataBlob, {
          contentType: 'application/json',
          cacheControl: '3600',
          upsert: false,
        });

      if (metadataError) throw new Error('Failed to upload metadata: ' + metadataError.message);

      const { data: { publicUrl: metadataUri } } = supabase.storage
        .from('avatars')
        .getPublicUrl(metadataFilePath);

      console.log('Metadata uploaded:', metadataUri);

      // Use Metaplex Digital Asset Standard (DAS) API via Helius to create NFT
      // This is a server-side operation that doesn't require wallet signing
      const createNftResponse = await fetch(`https://devnet.helius-rpc.com/?api-key=${heliusApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'nft-mint',
          method: 'mintCompressedNft',
          params: {
            name: metadata.name,
            symbol: metadata.symbol,
            owner: walletAddress,
            description: metadata.description,
            attributes: metadata.attributes || [],
            imageUrl: imageUrl,
            externalUrl: metadataUri,
            sellerFeeBasisPoints: metadata.sellerFeeBasisPoints || 500,
          },
        }),
      });

      const nftData = await createNftResponse.json();
      
      if (nftData.error) {
        console.error('NFT creation error:', nftData.error);
        throw new Error(nftData.error.message || 'Failed to create NFT');
      }

      return new Response(
        JSON.stringify({
          success: true,
          mint: nftData.result?.assetId || 'UNKNOWN',
          signature: nftData.result?.signature || 'UNKNOWN',
          metadataUri,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Handle metadata retrieval
    if (operation === 'get-metadata') {
      const response = await fetch(heliusRpc, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'get-asset',
          method: 'getAsset',
          params: { id: mintAddress },
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || 'Failed to fetch metadata');
      }

      const asset = data.result;
      const nftMetadata = {
        name: asset.content?.metadata?.name || '',
        symbol: asset.content?.metadata?.symbol || '',
        description: asset.content?.metadata?.description || '',
        image: asset.content?.links?.image || '',
        attributes: asset.content?.metadata?.attributes || [],
        sellerFeeBasisPoints: asset.royalty?.basis_points || 0,
      };

      return new Response(
        JSON.stringify({ success: true, metadata: nftMetadata }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    throw new Error('Invalid operation');

  } catch (error) {
    console.error('Error in mint-nft-proxy:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Operation failed',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
