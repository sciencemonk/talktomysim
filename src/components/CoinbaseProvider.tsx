import { ReactNode } from 'react';
import { CoinbaseWalletSDK } from '@coinbase/wallet-sdk';

interface CoinbaseProviderProps {
  children: ReactNode;
}

export const CoinbaseProvider = ({ children }: CoinbaseProviderProps) => {
  // Initialize Coinbase Wallet SDK for embedded wallets
  const coinbaseWallet = new CoinbaseWalletSDK({
    appName: 'Agentic Sales Platform',
    appLogoUrl: window.location.origin + '/sim-logo-light-final.png',
  });

  // Make wallet available globally
  (window as any).coinbaseWallet = coinbaseWallet;

  return <>{children}</>;
};
