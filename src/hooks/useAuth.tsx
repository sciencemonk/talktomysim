import { useState, useEffect, createContext, useContext } from 'react';
import { useSignOut } from '@coinbase/cdp-hooks';

interface AuthContextType {
  user: any | null;
  session: any | null;
  loading: boolean;
  signOut: () => Promise<void>;
  updateUser: (userData: any) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
  updateUser: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const { signOut: cdpSignOut } = useSignOut();

  useEffect(() => {
    // Check for existing Coinbase Wallet connection on mount
    const checkConnection = async () => {
      try {
        // Check localStorage for stored wallet address
        const storedAddress = localStorage.getItem('coinbase_wallet_address');
        if (storedAddress) {
          const userAccount = { address: storedAddress };
          setUser(userAccount);
          setSession({ user: userAccount });
        }

        // Also check if wallet is still connected
        const coinbaseWallet = (window as any).coinbaseWallet;
        if (coinbaseWallet) {
          const ethereum = coinbaseWallet.makeWeb3Provider();
          const accounts = await ethereum.request({ method: 'eth_accounts' });
          
          if (accounts && accounts.length > 0) {
            const userAccount = { address: accounts[0] };
            setUser(userAccount);
            setSession({ user: userAccount });
            localStorage.setItem('coinbase_wallet_address', accounts[0]);
          }
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      } finally {
        setLoading(false);
      }
    };

    checkConnection();

    // Listen for account changes
    if ((window as any).coinbaseWallet) {
      const ethereum = (window as any).coinbaseWallet.makeWeb3Provider();
      
      ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          const userAccount = { address: accounts[0] };
          setUser(userAccount);
          setSession({ user: userAccount });
          localStorage.setItem('coinbase_wallet_address', accounts[0]);
        } else {
          setUser(null);
          setSession(null);
          localStorage.removeItem('coinbase_wallet_address');
        }
      });

      ethereum.on('disconnect', () => {
        setUser(null);
        setSession(null);
        localStorage.removeItem('coinbase_wallet_address');
      });
    }
  }, []);

  const updateUser = (userData: any) => {
    setUser(userData);
    setSession({ user: userData });
    if (userData?.address) {
      localStorage.setItem('coinbase_wallet_address', userData.address);
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out user');
      // Sign out from Coinbase CDP
      await cdpSignOut();
      // Clear local state
      setUser(null);
      setSession(null);
      localStorage.removeItem('coinbase_wallet_address');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
