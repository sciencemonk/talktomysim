import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  wallet_address: string;
  email?: string;
  created_at: string;
  updated_at: string;
  last_sign_in?: string;
}

export const userProfileService = {
  /**
   * Get or create user profile by wallet address
   */
  async upsertProfile(walletAddress: string, email?: string): Promise<UserProfile | null> {
    try {
      // First, try to get existing profile
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('wallet_address', walletAddress)
        .maybeSingle();

      if (existingProfile) {
        // Update existing profile with email if provided and last sign in
        const updateData: any = {
          last_sign_in: new Date().toISOString()
        };
        
        if (email && email !== existingProfile.email) {
          updateData.email = email;
        }

        const { data: updatedProfile, error } = await supabase
          .from('user_profiles')
          .update(updateData)
          .eq('wallet_address', walletAddress)
          .select()
          .single();

        if (error) {
          console.error('Error updating profile:', error);
          return existingProfile;
        }

        return updatedProfile;
      } else {
        // Create new profile
        const { data: newProfile, error } = await supabase
          .from('user_profiles')
          .insert({
            wallet_address: walletAddress,
            email: email || null,
            last_sign_in: new Date().toISOString()
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating profile:', error);
          return null;
        }

        return newProfile;
      }
    } catch (error) {
      console.error('Error in upsertProfile:', error);
      return null;
    }
  },

  /**
   * Get user profile by wallet address
   */
  async getProfileByWallet(walletAddress: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('wallet_address', walletAddress)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getProfileByWallet:', error);
      return null;
    }
  }
};
