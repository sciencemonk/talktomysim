import { FC, ReactNode, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { 
  PhantomWalletAdapter, 
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

interface WalletProvidersProps {
  children: ReactNode;
}

export const WalletProviders: FC<WalletProvidersProps> = ({ children }) => {
  const network = WalletAdapterNetwork.Mainnet;
  
  // Solana RPC endpoint - IMPORTANT: For production use, get a free API key from:
  // - Helius: https://helius.dev (recommended)
  // - Alchemy: https://alchemy.com
  // The public RPC is rate-limited and will block requests
  const endpoint = useMemo(
    () => 'https://api.mainnet-beta.solana.com',
    []
  );

  // Configure Solana wallets - both Phantom and Solflare
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider 
        wallets={wallets} 
        autoConnect={false}
      >
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
