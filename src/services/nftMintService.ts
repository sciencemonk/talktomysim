import { Connection, Keypair, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, createInitializeMintInstruction, createAssociatedTokenAccountInstruction, createMintToInstruction, getMinimumBalanceForRentExemptMint, MINT_SIZE, getAssociatedTokenAddress } from '@solana/spl-token';

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
  wallet: any; // Solana wallet adapter
  metadata: NFTMetadata;
  supply: number;
}

/**
 * Upload metadata to Arweave or IPFS
 * For now, we'll use a simple JSON storage approach
 * In production, you'd use Arweave, NFT.Storage, or Pinata
 */
const uploadMetadata = async (metadata: NFTMetadata): Promise<string> => {
  // Convert metadata to JSON string
  const metadataJson = JSON.stringify(metadata);
  
  // For demo purposes, we'll create a data URL
  // In production, upload to Arweave or IPFS
  const metadataUrl = `data:application/json;base64,${btoa(metadataJson)}`;
  
  console.log('Metadata uploaded:', metadataUrl);
  return metadataUrl;
};

/**
 * Mint an NFT on Solana
 */
export const mintNFT = async ({
  wallet,
  metadata,
  supply = 1,
}: MintNFTParams): Promise<{ mint: string; signature: string }> => {
  try {
    if (!wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    // Connect to Solana mainnet
    const connection = new Connection('https://solana-mainnet.g.alchemy.com/v2/demo', 'confirmed');

    // Upload metadata
    const metadataUri = await uploadMetadata(metadata);

    // Create a new mint keypair
    const mintKeypair = Keypair.generate();
    const mintPublicKey = mintKeypair.publicKey;

    // Get the minimum lamports for rent exemption
    const lamports = await getMinimumBalanceForRentExemptMint(connection);

    // Get associated token account for the wallet
    const associatedTokenAccount = await getAssociatedTokenAddress(
      mintPublicKey,
      wallet.publicKey
    );

    // Create transaction
    const transaction = new Transaction();

    // Add instruction to create mint account
    transaction.add(
      SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: mintPublicKey,
        space: MINT_SIZE,
        lamports,
        programId: TOKEN_PROGRAM_ID,
      })
    );

    // Add instruction to initialize mint
    transaction.add(
      createInitializeMintInstruction(
        mintPublicKey,
        0, // 0 decimals for NFT
        wallet.publicKey, // mint authority
        wallet.publicKey, // freeze authority
        TOKEN_PROGRAM_ID
      )
    );

    // Add instruction to create associated token account
    transaction.add(
      createAssociatedTokenAccountInstruction(
        wallet.publicKey, // payer
        associatedTokenAccount, // associated token account
        wallet.publicKey, // owner
        mintPublicKey // mint
      )
    );

    // Add instruction to mint tokens
    transaction.add(
      createMintToInstruction(
        mintPublicKey,
        associatedTokenAccount,
        wallet.publicKey,
        supply, // amount
        [],
        TOKEN_PROGRAM_ID
      )
    );

    // Get recent blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = wallet.publicKey;

    // Partially sign with mint keypair
    transaction.partialSign(mintKeypair);

    // Sign and send transaction with wallet
    const signedTransaction = await wallet.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signedTransaction.serialize());

    // Confirm transaction
    await connection.confirmTransaction(signature, 'confirmed');

    console.log('NFT minted successfully:', {
      mint: mintPublicKey.toBase58(),
      signature,
      metadataUri,
    });

    return {
      mint: mintPublicKey.toBase58(),
      signature,
    };
  } catch (error) {
    console.error('Error minting NFT:', error);
    throw error;
  }
};

/**
 * Get NFT metadata from mint address
 */
export const getNFTMetadata = async (mintAddress: string): Promise<NFTMetadata | null> => {
  try {
    // In production, fetch from Metaplex metadata program
    // For now, return null
    return null;
  } catch (error) {
    console.error('Error fetching NFT metadata:', error);
    return null;
  }
};
