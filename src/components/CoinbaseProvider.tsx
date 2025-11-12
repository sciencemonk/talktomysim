import { ReactNode, useEffect } from 'react';
import CoinbaseWalletSDK from '@coinbase/wallet-sdk';

interface CoinbaseProviderProps {
  children: ReactNode;
}

export const CoinbaseProvider = ({ children }: CoinbaseProviderProps) => {
  useEffect(() => {
    const projectId = import.meta.env.VITE_CDP_PROJECT_ID;
    
    if (!projectId) {
      console.error('VITE_CDP_PROJECT_ID is not set');
      return;
    }

    // Initialize Coinbase Wallet SDK
    const coinbaseWallet = new CoinbaseWalletSDK({
      appName: 'Agentic Sales Platform',
      appLogoUrl: window.location.origin + '/sim-logo-light-final.png',
    });

    // Make wallet available globally if needed
    (window as any).coinbaseWallet = coinbaseWallet;
  }, []);

  return <>{children}</>;
};

