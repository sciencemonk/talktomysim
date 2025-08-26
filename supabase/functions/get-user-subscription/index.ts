import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  try {
    // Check authentication
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get user subscription
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (subError && subError.code !== 'PGRST116') {
      throw subError;
    }

    // Get current usage
    const { data: usage, error: usageError } = await supabase
      .rpc('get_current_user_usage', { user_uuid: user.id });

    if (usageError) {
      console.error('Error getting usage:', usageError);
    }

    const currentUsage = usage && usage.length > 0 ? usage[0] : {
      plan_id: 'free',
      messages_used: 0,
      messages_limit: 30,
      messages_remaining: 30,
      period_start: new Date().toISOString(),
      period_end: new Date().toISOString()
    };

    const result = {
      subscription: subscription ? {
        id: subscription.stripe_subscription_id,
        plan: subscription.plan_id,
        status: subscription.status,
        current_period_end: subscription.current_period_end,
        cancel_at_period_end: subscription.cancel_at_period_end,
      } : null,
      usage: {
        plan: currentUsage.plan_id,
        credits: currentUsage.messages_remaining,
        maxCredits: currentUsage.messages_limit,
        used: currentUsage.messages_used,
        periodStart: currentUsage.period_start,
        periodEnd: currentUsage.period_end,
      }
    };

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error getting user subscription:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
