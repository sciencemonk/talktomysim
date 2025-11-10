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

/**
 * Upload image and metadata to NFT.Storage (IPFS)
 */
const uploadToNFTStorage = async (
  imageFile: File,
  metadata: Omit<NFTMetadata, 'image'>
): Promise<{ imageUri: string; metadataUri: string }> => {
  try {
    // For production, you should use NFT.Storage or similar service
    // This requires an API key stored in Supabase secrets
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('metadata', JSON.stringify(metadata));

    // Call your edge function that handles NFT.Storage upload
    const response = await fetch(
      'https://uovhemqkztmkoozlmqxq.supabase.co/functions/v1/upload-nft-metadata',
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Failed to upload metadata to IPFS');
    }

    const data = await response.json();
    return {
      imageUri: data.imageUri,
      metadataUri: data.metadataUri,
    };
  } catch (error) {
    console.error('Error uploading to NFT.Storage:', error);
    throw new Error('Failed to upload NFT metadata. Please try again.');
  }
};

/**
 * Upload metadata using Metaplex's built-in storage
 */
const uploadMetadataWithMetaplex = async (
  umi: any,
  imageFile: File,
  metadata: Omit<NFTMetadata, 'image'>
): Promise<string> => {
  try {
    // Convert File to Buffer
    const imageBuffer = await imageFile.arrayBuffer();
    const imageBytes = new Uint8Array(imageBuffer);

    // Create generic file for Metaplex
    const genericFile = createGenericFile(imageBytes, imageFile.name, {
      contentType: imageFile.type,
      uniqueName: `${Date.now()}-${imageFile.name}`,
    });

    // Upload image using Metaplex's default storage (Arweave via Metaplex)
    const [imageUri] = await umi.uploader.upload([genericFile]);

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

    // Upload metadata JSON
    const metadataUri = await umi.uploader.uploadJson(completeMetadata);

    return metadataUri;
  } catch (error) {
    console.error('Error uploading metadata with Metaplex:', error);
    throw new Error('Failed to upload NFT metadata. Please try again.');
  }
};

/**
 * Mint an NFT on Solana using Metaplex
 */
export const mintNFT = async ({
  wallet,
  metadata,
  imageFile,
}: MintNFTParams): Promise<MintNFTResult> => {
  try {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error('Wallet not connected');
    }

    if (!imageFile) {
      throw new Error('Image file is required for NFT minting');
    }

    console.log('Starting NFT minting process...');

    // Initialize Umi with Solana mainnet
    const umi = createUmi('https://solana-mainnet.g.alchemy.com/v2/demo')
      .use(walletAdapterIdentity(wallet))
      .use(mplTokenMetadata());

    console.log('Uploading metadata to permanent storage...');

    // Upload metadata and image
    const metadataUri = await uploadMetadataWithMetaplex(umi, imageFile, {
      name: metadata.name,
      symbol: metadata.symbol,
      description: metadata.description,
      attributes: metadata.attributes,
      sellerFeeBasisPoints: metadata.sellerFeeBasisPoints,
      creators: metadata.creators,
    });

    console.log('Metadata uploaded:', metadataUri);

    // Generate a new mint keypair
    const mint = generateSigner(umi);

    console.log('Creating NFT on-chain...');

    // Create the NFT using Metaplex
    const result = await createNft(umi, {
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
    }).sendAndConfirm(umi);

    const signature = Buffer.from(result.signature).toString('base64');

    console.log('NFT minted successfully:', {
      mint: mint.publicKey,
      signature,
      metadataUri,
    });

    return {
      mint: mint.publicKey.toString(),
      signature,
      metadataUri,
    };
  } catch (error) {
    console.error('Error minting NFT:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('User rejected')) {
        throw new Error('Transaction was cancelled');
      }
      if (error.message.includes('insufficient funds')) {
        throw new Error('Insufficient SOL balance. You need ~0.02 SOL to mint an NFT.');
      }
      throw error;
    }
    
    throw new Error('Failed to mint NFT. Please try again.');
  }
};

/**
 * Get NFT metadata from mint address
 */
export const getNFTMetadata = async (
  mintAddress: string
): Promise<NFTMetadata | null> => {
  try {
    // Initialize Umi
    const umi = createUmi('https://solana-mainnet.g.alchemy.com/v2/demo').use(
      mplTokenMetadata()
    );

    // This would fetch the NFT metadata from the blockchain
    // Implementation depends on your specific needs
    console.log('Fetching NFT metadata for:', mintAddress);
    
    // For now, return null - implement when needed
    return null;
  } catch (error) {
    console.error('Error fetching NFT metadata:', error);
    return null;
  }
};

/**
 * Get estimated cost for minting an NFT
 */
export const getEstimatedMintCost = (): number => {
  // Estimated cost in SOL
  // Account creation: ~0.00089 SOL
  // Metadata account: ~0.0145 SOL
  // Transaction fees: ~0.00001 SOL
  // Storage fees (Arweave): ~0.001 SOL
  // Total: ~0.016 SOL
  return 0.02; // Adding buffer
};
