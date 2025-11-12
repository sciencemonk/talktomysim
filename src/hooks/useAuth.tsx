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
    // Don't auto-check for existing connections
    // Let users explicitly sign in via the modal/button
    setLoading(false);
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
