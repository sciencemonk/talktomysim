import { ReactNode } from 'react';
import { CoinbaseAuth } from '@coinbase/cdp-react';

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
    <CoinbaseAuth
      projectId={projectId}
      authMethods={['email', 'google', 'apple']}
    >
      {children}
    </CoinbaseAuth>
  );
};
