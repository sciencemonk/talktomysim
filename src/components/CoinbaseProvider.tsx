import { ReactNode } from 'react';
import { CDPReactProvider } from '@coinbase/cdp-react';

interface CoinbaseProviderProps {
  children: ReactNode;
}

export const CoinbaseProvider = ({ children }: CoinbaseProviderProps) => {
  const projectId = import.meta.env.VITE_CDP_PROJECT_ID;

  if (!projectId) {
    console.error('VITE_CDP_PROJECT_ID is not set - Coinbase features will not work');
    // Still render children but without CDP provider
    // This prevents the app from breaking but CDP features won't work
    return <>{children}</>;
  }

  return (
    <CDPReactProvider
      config={{
        projectId: projectId,
        ethereum: {
          createOnLogin: 'eoa' // Create Ethereum EOA wallet on login
        },
        solana: {
          createOnLogin: true // Create Solana wallet on login
        },
        appName: 'Agentic Sales Platform',
        authMethods: ['oauth:google', 'email'] // Google OAuth as primary, email as fallback
      }}
    >
      {children}
    </CDPReactProvider>
  );
};
