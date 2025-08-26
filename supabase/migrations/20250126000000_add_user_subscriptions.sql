-- Add user subscriptions table for Stripe integration
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_customer_id TEXT UNIQUE NOT NULL,
    stripe_subscription_id TEXT UNIQUE,
    plan_id TEXT NOT NULL DEFAULT 'free',
    status TEXT NOT NULL DEFAULT 'active',
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_customer_id ON user_subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_subscription_id ON user_subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);

-- Add user usage tracking table
CREATE TABLE IF NOT EXISTS user_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id TEXT NOT NULL DEFAULT 'free',
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    messages_used INTEGER DEFAULT 0,
    messages_limit INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for usage tracking
CREATE INDEX IF NOT EXISTS idx_user_usage_user_id ON user_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_user_usage_period ON user_usage(user_id, period_start, period_end);

-- Add message usage log for detailed tracking
CREATE TABLE IF NOT EXISTS message_usage_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    conversation_id TEXT,
    message_type TEXT NOT NULL, -- 'user' or 'assistant'
    tokens_used INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for message usage log
CREATE INDEX IF NOT EXISTS idx_message_usage_log_user_id ON message_usage_log(user_id);
CREATE INDEX IF NOT EXISTS idx_message_usage_log_created_at ON message_usage_log(created_at);
CREATE INDEX IF NOT EXISTS idx_message_usage_log_user_date ON message_usage_log(user_id, DATE(created_at));

-- Enable RLS on all tables
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_usage_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_subscriptions
CREATE POLICY "Users can view their own subscription" ON user_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription" ON user_subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all subscriptions" ON user_subscriptions
    FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for user_usage
CREATE POLICY "Users can view their own usage" ON user_usage
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all usage" ON user_usage
    FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for message_usage_log
CREATE POLICY "Users can view their own message usage" ON message_usage_log
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all message usage" ON message_usage_log
    FOR ALL USING (auth.role() = 'service_role');

-- Function to get current user usage
CREATE OR REPLACE FUNCTION get_current_user_usage(user_uuid UUID DEFAULT auth.uid())
RETURNS TABLE (
    plan_id TEXT,
    messages_used INTEGER,
    messages_limit INTEGER,
    messages_remaining INTEGER,
    period_start TIMESTAMPTZ,
    period_end TIMESTAMPTZ
) AS $$
DECLARE
    current_usage RECORD;
    current_subscription RECORD;
BEGIN
    -- Get current subscription
    SELECT us.plan_id, us.current_period_start, us.current_period_end
    INTO current_subscription
    FROM user_subscriptions us
    WHERE us.user_id = user_uuid AND us.status = 'active'
    ORDER BY us.created_at DESC
    LIMIT 1;

    -- If no subscription, default to free plan
    IF current_subscription IS NULL THEN
        current_subscription.plan_id := 'free';
        current_subscription.current_period_start := date_trunc('month', NOW());
        current_subscription.current_period_end := date_trunc('month', NOW()) + INTERVAL '1 month';
    END IF;

    -- Get or create current usage record
    SELECT uu.messages_used, uu.messages_limit
    INTO current_usage
    FROM user_usage uu
    WHERE uu.user_id = user_uuid 
    AND uu.period_start = current_subscription.current_period_start
    AND uu.period_end = current_subscription.current_period_end;

    -- If no usage record exists, create one
    IF current_usage IS NULL THEN
        INSERT INTO user_usage (
            user_id, 
            plan_id, 
            period_start, 
            period_end, 
            messages_used, 
            messages_limit
        ) VALUES (
            user_uuid,
            current_subscription.plan_id,
            current_subscription.current_period_start,
            current_subscription.current_period_end,
            0,
            CASE 
                WHEN current_subscription.plan_id = 'pro' THEN 1000
                WHEN current_subscription.plan_id = 'plus' THEN 100
                ELSE 30
            END
        );
        
        current_usage.messages_used := 0;
        current_usage.messages_limit := CASE 
            WHEN current_subscription.plan_id = 'pro' THEN 1000
            WHEN current_subscription.plan_id = 'plus' THEN 100
            ELSE 30
        END;
    END IF;

    RETURN QUERY SELECT 
        current_subscription.plan_id,
        current_usage.messages_used,
        current_usage.messages_limit,
        (current_usage.messages_limit - current_usage.messages_used) AS messages_remaining,
        current_subscription.current_period_start,
        current_subscription.current_period_end;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to consume a message credit
CREATE OR REPLACE FUNCTION consume_message_credit(user_uuid UUID DEFAULT auth.uid(), conversation_id_param TEXT DEFAULT NULL)
RETURNS TABLE (
    success BOOLEAN,
    messages_remaining INTEGER,
    messages_limit INTEGER
) AS $$
DECLARE
    current_usage RECORD;
    usage_record RECORD;
BEGIN
    -- Get current usage
    SELECT * INTO current_usage FROM get_current_user_usage(user_uuid);
    
    -- Check if user has credits remaining
    IF current_usage.messages_remaining <= 0 THEN
        RETURN QUERY SELECT FALSE, 0, current_usage.messages_limit;
        RETURN;
    END IF;

    -- Update usage
    UPDATE user_usage 
    SET messages_used = messages_used + 1,
        updated_at = NOW()
    WHERE user_id = user_uuid 
    AND period_start = current_usage.period_start
    AND period_end = current_usage.period_end;

    -- Log the usage
    INSERT INTO message_usage_log (user_id, conversation_id, message_type, tokens_used)
    VALUES (user_uuid, conversation_id_param, 'assistant', 1);

    RETURN QUERY SELECT 
        TRUE, 
        (current_usage.messages_remaining - 1),
        current_usage.messages_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to initialize free plan for new users
CREATE OR REPLACE FUNCTION initialize_user_subscription()
RETURNS TRIGGER AS $$
BEGIN
    -- Create a default free subscription for new users
    INSERT INTO user_subscriptions (
        user_id,
        stripe_customer_id,
        plan_id,
        status,
        current_period_start,
        current_period_end
    ) VALUES (
        NEW.id,
        'free_' || NEW.id, -- Temporary customer ID for free users
        'free',
        'active',
        date_trunc('month', NOW()),
        date_trunc('month', NOW()) + INTERVAL '1 month'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to initialize subscription for new users
DROP TRIGGER IF EXISTS trigger_initialize_user_subscription ON auth.users;
CREATE TRIGGER trigger_initialize_user_subscription
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION initialize_user_subscription();
