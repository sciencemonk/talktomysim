import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { createNft, mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';
import { generateSigner, percentAmount, publicKey } from '@metaplex-foundation/umi';
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { supabase } from '@/integrations/supabase/client';

export interface NFTMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
  attributes?: Array<{ trait_type: string; value: string }>;
  sellerFeeBasisPoints?: number; // Royalty percentage in basis points (500 = 5%)
  creators?: Array<{ address: string; share: number }>;
}

export interface MintNFTParams {
  wallet: WalletContextState;
  metadata: NFTMetadata;
  imageFile?: File;
}

export interface MintNFTResult {
  mint: string;
  signature: string;
  metadataUri: string;
}

// Get Solana RPC endpoint (public)
const getSolanaRpcEndpoint = (): string => {
  // Client-side uses public endpoint for wallet operations
  // Uploads use Helius server-side via proxy (no rate limits)
  return 'https://api.mainnet-beta.solana.com';
};

/**
 * Upload metadata using the Helius-powered proxy (no rate limits)
 */
const uploadMetadataWithProxy = async (
  imageFile: File,
  metadata: Omit<NFTMetadata, 'image'>,
  walletAddress: string,
  onProgress?: (stage: string) => void
): Promise<string> => {
  try {
    onProgress?.('Uploading image to storage...');
    
    // Convert image to base64
    const imageBase64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(imageFile);
    });

    onProgress?.('Creating metadata...');

    // Upload via proxy edge function
    const response = await supabase.functions.invoke('mint-nft-proxy', {
      body: {
        operation: 'upload-metadata',
        walletAddress,
        metadata: {
          name: metadata.name,
          symbol: metadata.symbol,
          description: metadata.description,
          attributes: metadata.attributes,
          sellerFeeBasisPoints: metadata.sellerFeeBasisPoints,
          creators: metadata.creators,
        },
        imageBase64,
        imageFileName: imageFile.name,
      },
    });

    if (response.error) {
      console.error('Proxy upload error:', response.error);
      throw new Error(response.error.message || 'Failed to upload metadata');
    }

    const { data } = response;

    if (!data.success) {
      throw new Error(data.error || 'Upload failed');
    }

    console.log('Metadata uploaded via proxy:', data.metadataUrl);
    return data.metadataUrl;

  } catch (error) {
    console.error('Error uploading metadata via proxy:', error);
    
    if (error instanceof Error) {
      throw new Error('Failed to upload NFT data: ' + error.message);
    }
    
    throw new Error('Failed to upload NFT metadata. Please try again.');
  }
};

/**
 * Confirm transaction with retry logic
 */
const confirmTransactionWithRetry = async (
  umi: any,
  signature: Uint8Array,
  maxRetries = 3
): Promise<void> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Confirming transaction (attempt ${attempt}/${maxRetries})...`);
      
      // Wait for confirmation with finalized commitment
      await umi.rpc.confirmTransaction(signature, {
        strategy: { type: 'blockhash', ...(await umi.rpc.getLatestBlockhash()) },
        commitment: 'finalized',
      });
      
      console.log('Transaction confirmed!');
      return;
    } catch (error) {
      if (attempt === maxRetries) {
        throw new Error('Transaction confirmation timeout. Please check Solscan to verify.');
      }
      console.log(`Confirmation attempt ${attempt} failed, retrying...`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s before retry
    }
  }
};

/**
 * Mint an NFT (uploads via Helius proxy, wallet operations client-side)
 */
export const mintNFT = async ({
  wallet,
  metadata,
  imageFile,
  onProgress,
}: MintNFTParams & { onProgress?: (stage: string) => void }): Promise<MintNFTResult> => {
  try {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error('Wallet not connected. Please connect your wallet and try again.');
    }

    if (!imageFile) {
      throw new Error('Image file is required for NFT minting');
    }

    console.log('Starting NFT minting process...');
    onProgress?.('Initializing...');

    // Get public RPC endpoint (for client-side wallet operations)
    const rpcEndpoint = getSolanaRpcEndpoint();
    console.log('Using public Solana RPC for wallet operations');
    console.log('Uploads will use Helius via server proxy (no rate limits)');

    // Initialize Umi with public RPC
    const umi = createUmi(rpcEndpoint)
      .use(walletAdapterIdentity(wallet))
      .use(mplTokenMetadata());

    // Upload metadata via Helius-powered proxy (no rate limits)
    const metadataUri = await uploadMetadataWithProxy(
      imageFile, 
      {
        name: metadata.name,
        symbol: metadata.symbol,
        description: metadata.description,
        attributes: metadata.attributes,
        sellerFeeBasisPoints: metadata.sellerFeeBasisPoints,
        creators: metadata.creators,
      },
      wallet.publicKey.toBase58(),
      onProgress
    );

    console.log('Metadata uploaded:', metadataUri);

    // Generate a new mint keypair
    const mint = generateSigner(umi);
    
    onProgress?.('Creating NFT on-chain...');
    console.log('Creating NFT with mint address:', mint.publicKey.toString());

    // Create the NFT using Metaplex
    const tx = createNft(umi, {
      mint,
      name: metadata.name,
      symbol: metadata.symbol,
      uri: metadataUri,
      sellerFeeBasisPoints: percentAmount((metadata.sellerFeeBasisPoints || 0) / 100),
      creators: metadata.creators?.map((creator) => ({
        address: publicKey(creator.address),
        verified: creator.address === wallet.publicKey.toBase58(),
        share: creator.share,
      })),
    });

    // Send and get signature
    const result = await tx.sendAndConfirm(umi, {
      confirm: { commitment: 'confirmed' },
    });

    const signature = Buffer.from(result.signature).toString('base64');
    const signatureHex = Buffer.from(result.signature).toString('hex');
    
    console.log('Transaction sent:', signatureHex);
    console.log('View on Solscan:', `https://solscan.io/tx/${signatureHex}`);
    
    onProgress?.('Confirming transaction...');

    // Confirm with retry logic
    await confirmTransactionWithRetry(umi, result.signature);

    console.log('NFT minted successfully:', {
      mint: mint.publicKey.toString(),
      signature: signatureHex,
      metadataUri,
    });

    onProgress?.('NFT created successfully!');

    return {
      mint: mint.publicKey.toString(),
      signature: signatureHex,
      metadataUri,
    };
  } catch (error) {
    console.error('Error minting NFT:', error);
    
    if (error instanceof Error) {
      // User rejected transaction
      if (error.message.includes('User rejected') || error.message.includes('rejected')) {
        throw new Error('Transaction was cancelled by user');
      }
      
      // Insufficient funds
      if (error.message.includes('insufficient funds') || error.message.includes('0x1')) {
        throw new Error('Insufficient SOL balance. You need approximately 0.02 SOL to mint an NFT (includes rent + transaction fees).');
      }
      
      // Network/RPC errors
      if (error.message.includes('429') || error.message.includes('rate limit')) {
        throw new Error('Network congestion. Please wait a moment and try again.');
      }
      
      if (error.message.includes('timeout') || error.message.includes('timed out')) {
        throw new Error('Transaction timeout. Your NFT may still be processing - check your wallet in a few minutes.');
      }
      
      // Wallet connection errors
      if (error.message.includes('Wallet not connected')) {
        throw error;
      }
      
      // Generic errors with helpful message
      throw new Error(`Minting failed: ${error.message}`);
    }
    
    throw new Error('Failed to mint NFT. Please check your connection and try again.');
  }
};

/**
 * Get NFT metadata from mint address using Helius DAS API
 */
export const getNFTMetadata = async (
  mintAddress: string
): Promise<NFTMetadata | null> => {
  try {
    // Try to use Helius proxy first
    try {
      const response = await supabase.functions.invoke('mint-nft-proxy', {
        body: {
          operation: 'rpc-call',
          rpcMethod: 'getAsset',
          rpcParams: { id: mintAddress },
        },
      });

      if (response.data?.success && response.data.result) {
        const asset = response.data.result;
        return {
          name: asset.content?.metadata?.name || '',
          symbol: asset.content?.metadata?.symbol || '',
          description: asset.content?.metadata?.description || '',
          image: asset.content?.links?.image || asset.content?.files?.[0]?.uri || '',
          attributes: asset.content?.metadata?.attributes || [],
          sellerFeeBasisPoints: asset.royalty?.basis_points || 0,
        };
      }
    } catch (proxyError) {
      console.warn('Helius proxy not available, using public endpoint');
    }

    // Fallback to public endpoint
    const rpcEndpoint = 'https://api.mainnet-beta.solana.com';
    const response = await fetch(rpcEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'my-id',
        method: 'getAsset',
        params: {
          id: mintAddress,
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch NFT metadata');
    }

    const data = await response.json();
    
    if (data.error) {
      console.error('Error from RPC:', data.error);
      return null;
    }

    const asset = data.result;
    
    return {
      name: asset.content?.metadata?.name || '',
      symbol: asset.content?.metadata?.symbol || '',
      description: asset.content?.metadata?.description || '',
      image: asset.content?.links?.image || asset.content?.files?.[0]?.uri || '',
      attributes: asset.content?.metadata?.attributes || [],
      sellerFeeBasisPoints: asset.royalty?.basis_points || 0,
    };
  } catch (error) {
    console.error('Error fetching NFT metadata:', error);
    return null;
  }
};

/**
 * Get estimated cost for minting an NFT
 */
export const getEstimatedMintCost = (): {
  total: number;
  breakdown: {
    mintAccount: number;
    metadataAccount: number;
    transactionFees: number;
    arweaveStorage: number;
  };
} => {
  // Estimated costs in SOL (as of 2024)
  const breakdown = {
    mintAccount: 0.00089,      // Rent for token mint account
    metadataAccount: 0.0145,   // Rent for metadata account
    transactionFees: 0.00001,  // Base transaction fee
    arweaveStorage: 0.0,       // Using Supabase storage (free)
  };
  
  const total = Object.values(breakdown).reduce((sum, cost) => sum + cost, 0);
  
  return {
    total: Math.ceil(total * 100) / 100, // Round up to 2 decimals
    breakdown,
  };
};

/**
 * Format transaction signature for Solscan
 */
export const getSolscanUrl = (signature: string, network: 'mainnet' | 'devnet' = 'mainnet'): string => {
  const cluster = network === 'devnet' ? '?cluster=devnet' : '';
  return `https://solscan.io/tx/${signature}${cluster}`;
};
