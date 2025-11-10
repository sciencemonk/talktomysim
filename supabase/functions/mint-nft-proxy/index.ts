import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';
import { createUmi } from 'https://esm.sh/@metaplex-foundation/umi-bundle-defaults@0.9.2';
import { createNft, mplTokenMetadata } from 'https://esm.sh/@metaplex-foundation/mpl-token-metadata@3.4.0';
import { generateSigner, percentAmount, signerIdentity } from 'https://esm.sh/@metaplex-foundation/umi@0.9.2';

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
      walletAddress,
      metadata,
      imageBase64,
      imageFileName,
      signedTransaction 
    } = await req.json();

    console.log('Minting NFT for wallet:', walletAddress);

    // Upload image to Supabase Storage
    const timestamp = Date.now();
    const imageFileName = `nft-images/${walletAddress}/${timestamp}-${imageFileName}`;
    
    // Convert base64 to buffer
    const imageBuffer = Uint8Array.from(atob(imageBase64), c => c.charCodeAt(0));
    
    const { data: imageData, error: imageError } = await supabase.storage
      .from('avatars')
      .upload(imageFileName, imageBuffer, {
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
      .getPublicUrl(imageFileName);

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
    const metadataFileName = `nft-metadata/${walletAddress}/${timestamp}-metadata.json`;
    const metadataBlob = new Blob([JSON.stringify(completeMetadata, null, 2)], {
      type: 'application/json',
    });

    const { data: metadataData, error: metadataError } = await supabase.storage
      .from('avatars')
      .upload(metadataFileName, metadataBlob, {
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
      .getPublicUrl(metadataFileName);

    console.log('Metadata uploaded to:', metadataUrl);

    // Initialize Umi with Helius RPC endpoint
    const rpcEndpoint = `https://mainnet.helius-rpc.com/?api-key=${heliusApiKey}`;
    const umi = createUmi(rpcEndpoint)
      .use(mplTokenMetadata());

    console.log('Connected to Solana via Helius RPC');

    // Generate a new mint keypair
    const mint = generateSigner(umi);

    console.log('Creating NFT with mint address:', mint.publicKey.toString());

    // Create the NFT using Metaplex
    const tx = await createNft(umi, {
      mint,
      name: metadata.name,
      symbol: metadata.symbol,
      uri: metadataUrl,
      sellerFeeBasisPoints: percentAmount((metadata.sellerFeeBasisPoints || 0) / 100),
      creators: metadata.creators?.map((creator: any) => ({
        address: creator.address,
        verified: creator.address === walletAddress,
        share: creator.share,
      })),
    });

    // Build the transaction
    const builtTx = await tx.buildAndSign(umi);
    
    // Send the transaction
    const signature = await umi.rpc.sendTransaction(builtTx);
    const signatureBase58 = Buffer.from(signature).toString('base64');
    const signatureHex = Buffer.from(signature).toString('hex');

    console.log('Transaction sent:', signatureHex);
    console.log('View on Solscan:', `https://solscan.io/tx/${signatureHex}`);

    // Confirm transaction
    await umi.rpc.confirmTransaction(signature, {
      strategy: { type: 'blockhash', ...(await umi.rpc.getLatestBlockhash()) },
      commitment: 'finalized',
    });

    console.log('NFT minted successfully:', {
      mint: mint.publicKey.toString(),
      signature: signatureHex,
      metadataUri: metadataUrl,
    });

    return new Response(
      JSON.stringify({
        success: true,
        mint: mint.publicKey.toString(),
        signature: signatureHex,
        metadataUri: metadataUrl,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in mint-nft-proxy:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to mint NFT',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
