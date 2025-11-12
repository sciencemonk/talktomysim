import { useState, useEffect, createContext, useContext } from 'react';
import { useSignOut } from '@coinbase/cdp-hooks';
import { userProfileService } from '@/services/userProfileService';

interface AuthContextType {
  user: any | null;
  session: any | null;
  loading: boolean;
  signOut: () => Promise<void>;
  updateUser: (userData: any) => void;
  refreshUserProfile: (walletAddress: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
  updateUser: () => {},
  refreshUserProfile: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const { signOut: cdpSignOut } = useSignOut();

  useEffect(() => {
    // Check for stored wallet address and fetch profile
    const storedWallet = localStorage.getItem('coinbase_wallet_address');
    if (storedWallet) {
      refreshUserProfile(storedWallet).then(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const refreshUserProfile = async (walletAddress: string) => {
    try {
      const profile = await userProfileService.getProfileByWallet(walletAddress);
      if (profile) {
        setUser({
          id: profile.id,
          email: profile.email,
          address: profile.wallet_address,
          coinbaseAuth: true,
          lastSignIn: profile.last_sign_in
        });
        setSession({ user: profile });
      }
    } catch (error) {
      console.error('Error refreshing user profile:', error);
    }
  };

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
      // Clear local state first
      setUser(null);
      setSession(null);
      localStorage.removeItem('coinbase_wallet_address');
      // Sign out from Coinbase CDP (may fail with 401 if already signed out)
      try {
        await cdpSignOut();
      } catch (cdpError) {
        // Ignore 401 errors from CDP as user is already signed out locally
        console.log('CDP sign out completed or already signed out');
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut, updateUser, refreshUserProfile }}>
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
