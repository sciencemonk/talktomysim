import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;

serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  
  if (!signature) {
    return new Response('No signature', { status: 400 });
  }

  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    console.log(`Processing Stripe webhook: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChanged(event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(`Webhook error: ${error.message}`, { status: 400 });
  }
});

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('Checkout completed:', session.id);
  
  if (!session.customer || !session.subscription) {
    console.log('No customer or subscription in session');
    return;
  }

  // Get the subscription details
  const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
  
  // Get the customer
  const customer = await stripe.customers.retrieve(session.customer as string);
  
  if (customer.deleted) {
    console.error('Customer was deleted');
    return;
  }

  // Find user by email
  const { data: user, error: userError } = await supabase.auth.admin.listUsers();
  if (userError) {
    console.error('Error finding user:', userError);
    return;
  }

  const targetUser = user.users.find(u => u.email === customer.email);
  if (!targetUser) {
    console.error('User not found for email:', customer.email);
    return;
  }

  // Update or create subscription record
  await upsertSubscription(targetUser.id, customer.id, subscription);
}

async function handleSubscriptionChanged(subscription: Stripe.Subscription) {
  console.log('Subscription changed:', subscription.id);
  
  if (!subscription.customer) {
    console.log('No customer in subscription');
    return;
  }

  // Get customer
  const customer = await stripe.customers.retrieve(subscription.customer as string);
  
  if (customer.deleted) {
    console.error('Customer was deleted');
    return;
  }

  // Find user by customer ID
  const { data: existingSubscription, error } = await supabase
    .from('user_subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customer.id)
    .single();

  if (error || !existingSubscription) {
    console.error('User not found for customer:', customer.id);
    return;
  }

  await upsertSubscription(existingSubscription.user_id, customer.id, subscription);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Subscription deleted:', subscription.id);
  
  // Update subscription status to cancelled
  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('Error updating cancelled subscription:', error);
  }

  // Downgrade user to free plan
  await downgradeToFreePlan(subscription.id);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Payment succeeded:', invoice.id);
  
  if (!invoice.subscription) {
    return;
  }

  // Update subscription status to active if it was past_due
  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      status: 'active',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', invoice.subscription);

  if (error) {
    console.error('Error updating subscription after payment:', error);
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Payment failed:', invoice.id);
  
  if (!invoice.subscription) {
    return;
  }

  // Update subscription status to past_due
  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      status: 'past_due',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', invoice.subscription);

  if (error) {
    console.error('Error updating subscription after failed payment:', error);
  }
}

async function upsertSubscription(userId: string, customerId: string, subscription: Stripe.Subscription) {
  // Determine plan from subscription
  const planId = getPlanFromSubscription(subscription);
  
  const subscriptionData = {
    user_id: userId,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    plan_id: planId,
    status: subscription.status,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('user_subscriptions')
    .upsert(subscriptionData, {
      onConflict: 'stripe_subscription_id',
    });

  if (error) {
    console.error('Error upserting subscription:', error);
    return;
  }

  // Reset usage for the new billing period
  await resetUsageForNewPeriod(userId, planId, subscriptionData.current_period_start, subscriptionData.current_period_end);
}

async function downgradeToFreePlan(subscriptionId: string) {
  // Get user from subscription
  const { data: subscription, error: subError } = await supabase
    .from('user_subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', subscriptionId)
    .single();

  if (subError || !subscription) {
    console.error('Error finding subscription for downgrade:', subError);
    return;
  }

  // Create free plan subscription
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      plan_id: 'free',
      status: 'active',
      current_period_start: periodStart.toISOString(),
      current_period_end: periodEnd.toISOString(),
      cancel_at_period_end: false,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscriptionId);

  if (error) {
    console.error('Error downgrading to free plan:', error);
    return;
  }

  // Reset usage for free plan
  await resetUsageForNewPeriod(subscription.user_id, 'free', periodStart.toISOString(), periodEnd.toISOString());
}

async function resetUsageForNewPeriod(userId: string, planId: string, periodStart: string, periodEnd: string) {
  const messagesLimit = planId === 'pro' ? 1000 : planId === 'plus' ? 100 : 30;

  const { error } = await supabase
    .from('user_usage')
    .upsert({
      user_id: userId,
      plan_id: planId,
      period_start: periodStart,
      period_end: periodEnd,
      messages_used: 0,
      messages_limit: messagesLimit,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,period_start,period_end',
    });

  if (error) {
    console.error('Error resetting usage:', error);
  }
}

function getPlanFromSubscription(subscription: Stripe.Subscription): string {
  // Extract plan from subscription metadata or price lookup
  if (subscription.metadata && subscription.metadata.plan_id) {
    return subscription.metadata.plan_id;
  }

  // Fallback: determine from price ID (you'll need to set this up based on your Stripe configuration)
  const priceId = subscription.items.data[0]?.price.id;
  
  // These would match your actual Stripe price IDs
  const priceIdToPlan: Record<string, string> = {
    [Deno.env.get('STRIPE_PLUS_PRICE_ID') || '']: 'plus',
    [Deno.env.get('STRIPE_PRO_PRICE_ID') || '']: 'pro',
  };

  return priceIdToPlan[priceId] || 'free';
}
