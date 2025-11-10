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

    const { 
      operation,
      walletAddress,
      metadata,
      imageBase64,
      imageFileName,
      rpcMethod,
      rpcParams
    } = await req.json();

    console.log(`Processing ${operation} request for wallet:`, walletAddress);

    // Handle metadata upload
    if (operation === 'upload-metadata') {
      // Upload image to Supabase Storage
      const timestamp = Date.now();
      const imageFilePath = `nft-images/${walletAddress}/${timestamp}-${imageFileName}`;
      
      // Convert base64 to buffer
      const imageBuffer = Uint8Array.from(atob(imageBase64), c => c.charCodeAt(0));
      
      const { data: imageData, error: imageError } = await supabase.storage
        .from('avatars')
        .upload(imageFilePath, imageBuffer, {
          contentType: 'image/png',
          cacheControl: '3600',
          upsert: false,
        });

      if (imageError) {
        console.error('Image upload error:', imageError);
        throw new Error('Failed to upload image: ' + imageError.message);
      }

      // Get public URL for the image
      const { data: { publicUrl: imageUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(imageFilePath);

      console.log('Image uploaded to:', imageUrl);

      // Create complete metadata with image URL
      const completeMetadata = {
        name: metadata.name,
        symbol: metadata.symbol,
        description: metadata.description,
        image: imageUrl,
        attributes: metadata.attributes || [],
        properties: {
          files: [
            {
              uri: imageUrl,
              type: 'image/png',
            },
          ],
          category: 'image',
        },
        seller_fee_basis_points: metadata.sellerFeeBasisPoints || 0,
        creators: metadata.creators || [],
      };

      // Upload metadata JSON to Supabase Storage
      const metadataFilePath = `nft-metadata/${walletAddress}/${timestamp}-metadata.json`;
      const metadataBlob = new Blob([JSON.stringify(completeMetadata, null, 2)], {
        type: 'application/json',
      });

      const { data: metadataData, error: metadataError } = await supabase.storage
        .from('avatars')
        .upload(metadataFilePath, metadataBlob, {
          contentType: 'application/json',
          cacheControl: '3600',
          upsert: false,
        });

      if (metadataError) {
        console.error('Metadata upload error:', metadataError);
        throw new Error('Failed to upload metadata: ' + metadataError.message);
      }

      // Get public URL for the metadata
      const { data: { publicUrl: metadataUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(metadataFilePath);

      console.log('Metadata uploaded to:', metadataUrl);

      return new Response(
        JSON.stringify({
          success: true,
          imageUrl,
          metadataUrl,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Handle Helius RPC proxy
    if (operation === 'rpc-call') {
      const rpcEndpoint = `https://mainnet.helius-rpc.com/?api-key=${heliusApiKey}`;
      
      console.log(`Proxying RPC call: ${rpcMethod}`);

      const rpcResponse = await fetch(rpcEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: '1',
          method: rpcMethod,
          params: rpcParams || [],
        }),
      });

      const rpcData = await rpcResponse.json();

      if (rpcData.error) {
        console.error('RPC error:', rpcData.error);
        throw new Error(rpcData.error.message || 'RPC call failed');
      }

      return new Response(
        JSON.stringify({
          success: true,
          result: rpcData.result,
        }),
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
