import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export { stripePromise };

// Price IDs for each plan (these would be created in Stripe Dashboard)
export const STRIPE_PRICE_IDS = {
  free: null, // Free plan doesn't have a price ID
  plus: import.meta.env.VITE_STRIPE_PLUS_PRICE_ID,
  pro: import.meta.env.VITE_STRIPE_PRO_PRICE_ID,
} as const;

// Plan configurations that match Stripe products
export const STRIPE_PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    priceDisplay: 'Free',
    credits: 30,
    features: [
      '30 monthly messages',
      'Basic AI conversations',
      'Standard support',
      'Community access'
    ]
  },
  plus: {
    id: 'plus',
    name: 'Plus',
    price: 20,
    priceDisplay: '$20/month',
    credits: 100,
    features: [
      '100 monthly messages',
      'Advanced AI conversations',
      'Priority support',
      'Enhanced features',
      'Conversation history'
    ]
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 200,
    priceDisplay: '$200/month',
    credits: 1000,
    features: [
      '1,000+ monthly messages',
      'Unlimited AI conversations',
      'Premium support',
      'All features included',
      'Advanced analytics',
      'Custom integrations'
    ]
  }
} as const;

export type PlanId = keyof typeof STRIPE_PLANS;
