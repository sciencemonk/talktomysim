import { supabase } from '@/integrations/supabase/client';

export interface OnboardingStatus {
  hasSimAccount: boolean;
  needsWallet: boolean;
  needsTraining: boolean;
  simId?: string;
  hasLegacyAdvisor: boolean;
  legacyAdvisorId?: string;
}

export async function checkUserOnboardingStatus(userId: string): Promise<OnboardingStatus> {
  // First check if user has a SIM in the new sims table
  const { data: existingSim } = await supabase
    .from('sims')
    .select('id, crypto_wallet, training_completed')
    .eq('user_id', userId)
    .maybeSingle();

  if (existingSim) {
    return {
      hasSimAccount: true,
      needsWallet: false,
      needsTraining: !existingSim.training_completed,
      simId: existingSim.id,
      hasLegacyAdvisor: false,
    };
  }

  // If no SIM found, check if they have a legacy X-authenticated advisor
  const { data: legacyAdvisor } = await supabase
    .from('advisors')
    .select('id, crypto_wallet, twitter_url')
    .eq('user_id', userId)
    .not('twitter_url', 'is', null)
    .maybeSingle();

  if (legacyAdvisor) {
    return {
      hasSimAccount: false,
      needsWallet: !legacyAdvisor.crypto_wallet,
      needsTraining: true,
      hasLegacyAdvisor: true,
      legacyAdvisorId: legacyAdvisor.id,
    };
  }

  // New user, needs complete onboarding
  return {
    hasSimAccount: false,
    needsWallet: true,
    needsTraining: true,
    hasLegacyAdvisor: false,
  };
}
