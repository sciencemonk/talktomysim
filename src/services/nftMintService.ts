import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { createNft, mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';
import { generateSigner, percentAmount, createGenericFile, publicKey } from '@metaplex-foundation/umi';
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';

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

// Get Helius RPC endpoint from environment
const getHeliusRpcEndpoint = (): string => {
  // In production, use Helius API key from environment
  return 'https://mainnet.helius-rpc.com/?api-key=c2732bf1-5cad-4f76-938c-e3d3ec8e57c9';
};

/**
 * Upload metadata using Metaplex's built-in storage (Arweave)
 */
const uploadMetadataWithMetaplex = async (
  umi: any,
  imageFile: File,
  metadata: Omit<NFTMetadata, 'image'>,
  onProgress?: (stage: string) => void
): Promise<string> => {
  try {
    onProgress?.('Preparing image for upload...');
    
    // Convert File to Buffer
    const imageBuffer = await imageFile.arrayBuffer();
    const imageBytes = new Uint8Array(imageBuffer);

    // Create generic file for Metaplex
    const genericFile = createGenericFile(imageBytes, imageFile.name, {
      contentType: imageFile.type,
      uniqueName: `${Date.now()}-${imageFile.name}`,
    });

    onProgress?.('Uploading image to Arweave...');
    
    // Upload image using Metaplex's default storage (Arweave via Metaplex)
    const [imageUri] = await umi.uploader.upload([genericFile]);
    console.log('Image uploaded to:', imageUri);

    onProgress?.('Creating metadata...');
    
    // Create complete metadata with image URI
    const completeMetadata = {
      name: metadata.name,
      symbol: metadata.symbol,
      description: metadata.description,
      image: imageUri,
      attributes: metadata.attributes || [],
      properties: {
        files: [
          {
            uri: imageUri,
            type: imageFile.type,
          },
        ],
        category: 'image',
      },
      sellerFeeBasisPoints: metadata.sellerFeeBasisPoints || 0,
      creators: metadata.creators || [],
    };

    onProgress?.('Uploading metadata to Arweave...');
    
    // Upload metadata JSON
    const metadataUri = await umi.uploader.uploadJson(completeMetadata);
    console.log('Metadata uploaded to:', metadataUri);

    return metadataUri;
  } catch (error) {
    console.error('Error uploading metadata with Metaplex:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('storage') || error.message.includes('upload')) {
        throw new Error('Failed to upload to Arweave. Please check your connection and try again.');
      }
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
 * Mint an NFT on Solana using Metaplex
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

    // Initialize Umi with Helius RPC endpoint
    const rpcEndpoint = getHeliusRpcEndpoint();
    const umi = createUmi(rpcEndpoint)
      .use(walletAdapterIdentity(wallet))
      .use(mplTokenMetadata());

    console.log('Connected to Solana via Helius RPC');

    // Upload metadata and image
    const metadataUri = await uploadMetadataWithMetaplex(
      umi, 
      imageFile, 
      {
        name: metadata.name,
        symbol: metadata.symbol,
        description: metadata.description,
        attributes: metadata.attributes,
        sellerFeeBasisPoints: metadata.sellerFeeBasisPoints,
        creators: metadata.creators,
      },
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
      sellerFeeBasisPoints: percentAmount(metadata.sellerFeeBasisPoints || 0),
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
    const rpcEndpoint = getHeliusRpcEndpoint();
    
    // Use Helius DAS API to fetch NFT metadata
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
      console.error('Error from Helius:', data.error);
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
    arweaveStorage: 0.001,     // Arweave storage via Metaplex
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
