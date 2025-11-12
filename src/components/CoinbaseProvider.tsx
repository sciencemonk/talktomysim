import { ReactNode } from 'react';
import { CDPReactProvider } from '@coinbase/cdp-react';

interface CoinbaseProviderProps {
  children: ReactNode;
}

export const CoinbaseProvider = ({ children }: CoinbaseProviderProps) => {
  const projectId = import.meta.env.VITE_CDP_PROJECT_ID;

  if (!projectId) {
    console.error('VITE_CDP_PROJECT_ID is not set');
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
        appName: 'Agentic Sales Platform'
      }}
    >
      {children}
    </CDPReactProvider>
  );
};
