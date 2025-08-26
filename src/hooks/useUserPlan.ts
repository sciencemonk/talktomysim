import { useState, useEffect } from 'react';
import { paymentService } from '@/services/paymentService';
import { PlanId } from '@/lib/stripe';
import { useAuth } from '@/hooks/useAuth';

interface UserPlanData {
  plan: PlanId;
  credits: number;
  maxCredits: number;
  hasActiveSubscription: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useUserPlan = (): UserPlanData => {
  const { user } = useAuth();
  const [planData, setPlanData] = useState<UserPlanData>({
    plan: 'free',
    credits: 30,
    maxCredits: 30,
    hasActiveSubscription: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const loadUserPlan = async () => {
      if (!user) {
        setPlanData(prev => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        setPlanData(prev => ({ ...prev, isLoading: true, error: null }));
        
        const data = await paymentService.getUserPlanAndCredits();
        
        setPlanData({
          plan: data.plan,
          credits: data.credits,
          maxCredits: data.maxCredits,
          hasActiveSubscription: !!data.subscription,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error('Error loading user plan:', error);
        setPlanData(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to load plan data',
        }));
      }
    };

    loadUserPlan();
  }, [user]);

  return planData;
};
