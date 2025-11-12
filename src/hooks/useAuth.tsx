import { useState, useEffect, createContext, useContext } from 'react';
import { useCurrentUser, useSignOut } from '@coinbase/cdp-hooks';

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
  const { currentUser, isLoading } = useCurrentUser();
  const { signOut: coinbaseSignOut } = useSignOut();
  const [user, setUser] = useState<any | null>(null);
  const [session, setSession] = useState<any | null>(null);

  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
      setSession({ user: currentUser });
    } else {
      setUser(null);
      setSession(null);
    }
  }, [currentUser]);

  const signOut = async () => {
    try {
      console.log('Signing out user');
      await coinbaseSignOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading: isLoading, signOut }}>
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
