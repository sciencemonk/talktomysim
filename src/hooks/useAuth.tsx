import { useState, useEffect, createContext, useContext } from 'react';

interface AuthContextType {
  user: any | null;
  session: any | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing Coinbase Wallet connection
    const checkConnection = async () => {
      try {
        const coinbaseWallet = (window as any).coinbaseWallet;
        if (coinbaseWallet) {
          const ethereum = coinbaseWallet.makeWeb3Provider();
          const accounts = await ethereum.request({ method: 'eth_accounts' });
          
          if (accounts && accounts.length > 0) {
            const userAccount = { address: accounts[0] };
            setUser(userAccount);
            setSession({ user: userAccount });
          }
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      } finally {
        setLoading(false);
      }
    };

    checkConnection();
  }, []);

  const signOut = async () => {
    try {
      console.log('Signing out user');
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
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
