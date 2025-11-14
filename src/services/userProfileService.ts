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
  async upsertProfile(walletAddress: string, email?: string, retries = 2): Promise<UserProfile | null> {
    try {
      console.log('[upsertProfile] Starting for wallet:', walletAddress);
      
      // First, try to get existing profile
      const { data: existingProfile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('wallet_address', walletAddress)
        .maybeSingle();

      if (fetchError) {
        console.error('[upsertProfile] Error fetching existing profile:', fetchError);
        if (retries > 0) {
          console.log('[upsertProfile] Retrying...', retries, 'attempts left');
          await new Promise(resolve => setTimeout(resolve, 1000));
          return this.upsertProfile(walletAddress, email, retries - 1);
        }
        return null;
      }

      if (existingProfile) {
        console.log('[upsertProfile] Updating existing profile');
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
          console.error('[upsertProfile] Error updating profile:', error);
          if (retries > 0) {
            console.log('[upsertProfile] Retrying update...', retries, 'attempts left');
            await new Promise(resolve => setTimeout(resolve, 1000));
            return this.upsertProfile(walletAddress, email, retries - 1);
          }
          return existingProfile;
        }

        console.log('[upsertProfile] Profile updated successfully');
        return updatedProfile;
      } else {
        console.log('[upsertProfile] Creating new profile');
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
          console.error('[upsertProfile] Error creating profile:', error);
          if (retries > 0) {
            console.log('[upsertProfile] Retrying create...', retries, 'attempts left');
            await new Promise(resolve => setTimeout(resolve, 1000));
            return this.upsertProfile(walletAddress, email, retries - 1);
          }
          return null;
        }

        console.log('[upsertProfile] Profile created successfully');
        return newProfile;
      }
    } catch (error) {
      console.error('[upsertProfile] Unexpected error:', error);
      if (retries > 0) {
        console.log('[upsertProfile] Retrying after unexpected error...', retries, 'attempts left');
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this.upsertProfile(walletAddress, email, retries - 1);
      }
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
