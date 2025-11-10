import { WalletContextState } from '@solana/wallet-adapter-react';
import { 
  Connection, 
  PublicKey, 
  Transaction, 
  SystemProgram,
  LAMPORTS_PER_SOL 
} from '@solana/web3.js';
import { 
  getAssociatedTokenAddress, 
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { supabase } from '@/integrations/supabase/client';

// USDC Mint address on Solana Mainnet
const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');

export interface PurchaseNFTParams {
  nftId: string;
  wallet: WalletContextState;
  sellerWallet: string;
  price: number;
  mintAddress: string;
}

export const purchaseNFT = async ({
  nftId,
  wallet,
  sellerWallet,
  price,
  mintAddress,
}: PurchaseNFTParams): Promise<{ success: boolean; signature?: string; error?: string }> => {
  try {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error('Wallet not connected');
    }

    console.log('Initiating NFT purchase...', { nftId, price, sellerWallet });

    // Step 1: Initialize purchase record on backend
    const { data: initData, error: initError } = await supabase.functions.invoke(
      'purchase-nft',
      {
        body: {
          nftId,
          buyerWallet: wallet.publicKey.toBase58(),
          sellerWallet,
          price,
          mintAddress,
        },
      }
    );

    if (initError || !initData?.success) {
      throw new Error(initData?.error || initError?.message || 'Failed to initialize purchase');
    }

    console.log('Purchase initialized:', initData);

    // Step 2: Create and sign transaction
    const connection = new Connection(
      import.meta.env.VITE_HELIUS_API_KEY 
        ? `https://mainnet.helius-rpc.com/?api-key=${import.meta.env.VITE_HELIUS_API_KEY}`
        : 'https://api.mainnet-beta.solana.com',
      'confirmed'
    );

    const sellerPublicKey = new PublicKey(sellerWallet);
    
    // Get associated token accounts for USDC
    const buyerUSDCAccount = await getAssociatedTokenAddress(
      USDC_MINT,
      wallet.publicKey
    );
    
    const sellerUSDCAccount = await getAssociatedTokenAddress(
      USDC_MINT,
      sellerPublicKey
    );

    // Create transaction
    const transaction = new Transaction();
    
    // USDC has 6 decimals
    const usdcAmount = price * 1_000_000;
    
    // Add USDC transfer instruction
    transaction.add(
      createTransferInstruction(
        buyerUSDCAccount,
        sellerUSDCAccount,
        wallet.publicKey,
        usdcAmount,
        [],
        TOKEN_PROGRAM_ID
      )
    );

    // Get latest blockhash
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = wallet.publicKey;

    console.log('Transaction created, requesting signature...');

    // Sign and send transaction
    const signedTransaction = await wallet.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signedTransaction.serialize());

    console.log('Transaction sent:', signature);

    // Wait for confirmation
    await connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight,
    });

    console.log('Transaction confirmed');

    // Step 3: Confirm purchase on backend
    const { data: confirmData, error: confirmError } = await supabase.functions.invoke(
      'confirm-nft-purchase',
      {
        body: {
          purchaseId: initData.purchaseId,
          transactionSignature: signature,
          buyerWallet: wallet.publicKey.toBase58(),
        },
      }
    );

    if (confirmError || !confirmData?.success) {
      console.error('Failed to confirm purchase:', confirmError || confirmData);
      // Transaction succeeded but backend confirmation failed
      // Return success with warning
      return {
        success: true,
        signature,
        error: 'Payment sent but backend confirmation pending. Contact support if needed.',
      };
    }

    return {
      success: true,
      signature,
    };

  } catch (error: any) {
    console.error('NFT purchase error:', error);
    
    if (error.message?.includes('insufficient funds')) {
      return {
        success: false,
        error: 'Insufficient USDC balance',
      };
    }
    
    if (error.message?.includes('User rejected')) {
      return {
        success: false,
        error: 'Transaction cancelled by user',
      };
    }

    return {
      success: false,
      error: error.message || 'Purchase failed',
    };
  }
};

export const checkUSDCBalance = async (
  wallet: WalletContextState
): Promise<{ balance: number; hasBalance: boolean }> => {
  if (!wallet.publicKey) {
    return { balance: 0, hasBalance: false };
  }

  try {
    const connection = new Connection(
      import.meta.env.VITE_HELIUS_API_KEY 
        ? `https://mainnet.helius-rpc.com/?api-key=${import.meta.env.VITE_HELIUS_API_KEY}`
        : 'https://api.mainnet-beta.solana.com',
      'confirmed'
    );

    const usdcAccount = await getAssociatedTokenAddress(
      USDC_MINT,
      wallet.publicKey
    );

    const accountInfo = await connection.getTokenAccountBalance(usdcAccount);
    const balance = accountInfo.value.uiAmount || 0;

    return {
      balance,
      hasBalance: balance > 0,
    };
  } catch (error) {
    console.error('Error checking USDC balance:', error);
    return { balance: 0, hasBalance: false };
  }
};
