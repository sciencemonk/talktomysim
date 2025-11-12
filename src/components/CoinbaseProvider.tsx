import { ReactNode, useEffect, useState } from 'react';

interface CoinbaseProviderProps {
  children: ReactNode;
}

export const CoinbaseProvider = ({ children }: CoinbaseProviderProps) => {
  const [sdkLoaded, setSdkLoaded] = useState(false);

  useEffect(() => {
    const initializeCoinbaseSDK = async () => {
      try {
        const projectId = import.meta.env.VITE_CDP_PROJECT_ID;
        
        if (!projectId) {
          console.warn('VITE_CDP_PROJECT_ID is not set - Coinbase Wallet features disabled');
          setSdkLoaded(true);
          return;
        }

        // Dynamically import the SDK to handle potential loading issues
        const { default: CoinbaseWalletSDK } = await import('@coinbase/wallet-sdk');

        // Initialize Coinbase Wallet SDK
        const coinbaseWallet = new CoinbaseWalletSDK({
          appName: 'Agentic Sales Platform',
          appLogoUrl: window.location.origin + '/sim-logo-light-final.png',
        });

        // Make wallet available globally
        (window as any).coinbaseWallet = coinbaseWallet;
        setSdkLoaded(true);
      } catch (error) {
        console.error('Failed to initialize Coinbase Wallet SDK:', error);
        setSdkLoaded(true); // Continue without SDK
      }
    };

    initializeCoinbaseSDK();
  }, []);

  // Don't block rendering on SDK load
  return <>{children}</>;
};

