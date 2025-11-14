import { useState, useEffect, createContext, useContext } from 'react';
import { useSignOut } from '@coinbase/cdp-hooks';
import { userProfileService } from '@/services/userProfileService';
import { supabase } from '@/integrations/supabase/client';

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
    const explicitSignout = localStorage.getItem('explicit_signout');
    
    // Don't auto-authenticate if user explicitly signed out
    if (storedWallet && explicitSignout !== 'true') {
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
      // Set flag to prevent auto re-authentication
      localStorage.setItem('explicit_signout', 'true');
      
      // Clear local state first
      setUser(null);
      setSession(null);
      localStorage.removeItem('coinbase_wallet_address');
      
      // Sign out from both Coinbase CDP and Supabase
      await Promise.all([
        cdpSignOut().catch(() => console.log('CDP sign out completed or already signed out')),
        supabase.auth.signOut().catch(() => console.log('Supabase sign out completed or already signed out'))
      ]);
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
