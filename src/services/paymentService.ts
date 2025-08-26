import { supabase } from '@/integrations/supabase/client';
import { stripePromise, STRIPE_PRICE_IDS, PlanId } from '@/lib/stripe';

export interface CheckoutSessionData {
  sessionId: string;
  url: string;
}

export interface SubscriptionData {
  id: string;
  status: string;
  plan: PlanId;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

class PaymentService {
  /**
   * Create a Stripe checkout session for plan upgrade
   */
  async createCheckoutSession(planId: PlanId): Promise<CheckoutSessionData> {
    const priceId = STRIPE_PRICE_IDS[planId];
    
    if (!priceId) {
      throw new Error(`No price ID configured for plan: ${planId}`);
    }

    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: {
        priceId,
        planId,
      },
    });

    if (error) {
      console.error('Error creating checkout session:', error);
      throw new Error('Failed to create checkout session');
    }

    return data;
  }

  /**
   * Redirect to Stripe checkout
   */
  async redirectToCheckout(planId: PlanId): Promise<void> {
    try {
      const { sessionId } = await this.createCheckoutSession(planId);
      const stripe = await stripePromise;
      
      if (!stripe) {
        throw new Error('Stripe failed to initialize');
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (error) {
        console.error('Stripe redirect error:', error);
        throw new Error('Failed to redirect to checkout');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      throw error;
    }
  }

  /**
   * Create a billing portal session for subscription management
   */
  async createBillingPortalSession(): Promise<{ url: string }> {
    const { data, error } = await supabase.functions.invoke('create-billing-portal-session');

    if (error) {
      console.error('Error creating billing portal session:', error);
      throw new Error('Failed to create billing portal session');
    }

    return data;
  }

  /**
   * Redirect to Stripe billing portal
   */
  async redirectToBillingPortal(): Promise<void> {
    try {
      const { url } = await this.createBillingPortalSession();
      window.location.href = url;
    } catch (error) {
      console.error('Billing portal error:', error);
      throw error;
    }
  }

  /**
   * Get current user subscription
   */
  async getCurrentSubscription(): Promise<SubscriptionData | null> {
    const { data, error } = await supabase.functions.invoke('get-user-subscription');

    if (error) {
      console.error('Error getting subscription:', error);
      return null;
    }

    return data;
  }

  /**
   * Cancel subscription at period end
   */
  async cancelSubscription(): Promise<void> {
    const { error } = await supabase.functions.invoke('cancel-subscription');

    if (error) {
      console.error('Error canceling subscription:', error);
      throw new Error('Failed to cancel subscription');
    }
  }

  /**
   * Reactivate subscription
   */
  async reactivateSubscription(): Promise<void> {
    const { error } = await supabase.functions.invoke('reactivate-subscription');

    if (error) {
      console.error('Error reactivating subscription:', error);
      throw new Error('Failed to reactivate subscription');
    }
  }

  /**
   * Get user's current plan and credits
   */
  async getUserPlanAndCredits(): Promise<{
    plan: PlanId;
    credits: number;
    maxCredits: number;
    subscription?: SubscriptionData;
  }> {
    try {
      // First try to get from subscription
      const subscription = await this.getCurrentSubscription();
      
      if (subscription && subscription.status === 'active') {
        return {
          plan: subscription.plan,
          credits: await this.getUserCredits(),
          maxCredits: this.getMaxCreditsForPlan(subscription.plan),
          subscription,
        };
      }

      // Fallback to free plan
      return {
        plan: 'free',
        credits: await this.getUserCredits(),
        maxCredits: 30,
      };
    } catch (error) {
      console.error('Error getting user plan:', error);
      // Return free plan as fallback
      return {
        plan: 'free',
        credits: 30,
        maxCredits: 30,
      };
    }
  }

  /**
   * Get user's current message credits
   */
  private async getUserCredits(): Promise<number> {
    // This would integrate with your usage tracking system
    // For now, return a mock value
    const { data, error } = await supabase.functions.invoke('get-user-credits');
    
    if (error) {
      console.error('Error getting user credits:', error);
      return 30; // Default free credits
    }
    
    return data.credits || 30;
  }

  /**
   * Get max credits for a plan
   */
  private getMaxCreditsForPlan(plan: PlanId): number {
    switch (plan) {
      case 'free': return 30;
      case 'plus': return 100;
      case 'pro': return 1000;
      default: return 30;
    }
  }

  /**
   * Consume a message credit
   */
  async consumeCredit(): Promise<{ success: boolean; remaining: number }> {
    const { data, error } = await supabase.functions.invoke('consume-credit');

    if (error) {
      console.error('Error consuming credit:', error);
      throw new Error('Failed to consume credit');
    }

    return data;
  }
}

export const paymentService = new PaymentService();
