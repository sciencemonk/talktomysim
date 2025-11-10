import { WalletContextState } from '@solana/wallet-adapter-react';
import { supabase } from '@/integrations/supabase/client';

export interface NFTMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
  attributes?: Array<{ trait_type: string; value: string }>;
  sellerFeeBasisPoints?: number;
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

/**
 * Mint NFT completely server-side using Helius (no rate limits)
 */
export const mintNFT = async ({
  wallet,
  metadata,
  imageFile,
  onProgress,
}: MintNFTParams & { onProgress?: (stage: string) => void }): Promise<MintNFTResult> => {
  try {
    if (!wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    if (!imageFile) {
      throw new Error('Image file is required');
    }

    console.log('Starting server-side NFT minting...');
    onProgress?.('Uploading image and metadata...');

    // Convert image to base64
    const imageBase64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        resolve(base64.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(imageFile);
    });

    onProgress?.('Creating NFT on Solana...');
    
    // Call edge function to do everything server-side
    const response = await supabase.functions.invoke('mint-nft-proxy', {
      body: {
        operation: 'mint-nft',
        walletAddress: wallet.publicKey.toBase58(),
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
      throw new Error(response.error.message || 'Failed to mint NFT');
    }

    if (!response.data?.success) {
      throw new Error(response.data?.error || 'Minting failed');
    }

    onProgress?.('NFT minted successfully!');

    console.log('NFT minted:', response.data);

    return {
      mint: response.data.mint,
      signature: response.data.signature,
      metadataUri: response.data.metadataUri,
    };
  } catch (error) {
    console.error('Error minting NFT:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('insufficient funds')) {
        throw new Error('Insufficient SOL balance. You need approximately 0.02 SOL to mint.');
      }
      throw new Error(`Minting failed: ${error.message}`);
    }
    
    throw new Error('Failed to mint NFT');
  }
};

/**
 * Get NFT metadata from mint address
 */
export const getNFTMetadata = async (
  mintAddress: string
): Promise<NFTMetadata | null> => {
  try {
    const response = await supabase.functions.invoke('mint-nft-proxy', {
      body: {
        operation: 'get-metadata',
        mintAddress,
      },
    });

    if (response.data?.success && response.data.metadata) {
      return response.data.metadata;
    }

    return null;
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
  const breakdown = {
    mintAccount: 0.00089,
    metadataAccount: 0.0145,
    transactionFees: 0.00001,
    arweaveStorage: 0.0,
  };
  
  const total = Object.values(breakdown).reduce((sum, cost) => sum + cost, 0);
  
  return {
    total: Math.ceil(total * 100) / 100,
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
