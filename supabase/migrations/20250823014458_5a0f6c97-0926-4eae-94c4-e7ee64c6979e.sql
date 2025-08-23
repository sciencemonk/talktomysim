
-- Add conversation scoring and metadata columns to messages table
ALTER TABLE messages ADD COLUMN score INTEGER DEFAULT 0;
ALTER TABLE messages ADD COLUMN intent TEXT;
ALTER TABLE messages ADD COLUMN urgency_level TEXT CHECK (urgency_level IN ('low', 'medium', 'high', 'critical'));
ALTER TABLE messages ADD COLUMN metadata JSONB DEFAULT '{}';

-- Create escalation_rules table for per-agent configuration
CREATE TABLE escalation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advisor_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Scoring thresholds
  score_threshold INTEGER DEFAULT 7,
  message_count_threshold INTEGER DEFAULT 5,
  
  -- Keywords and triggers
  urgency_keywords TEXT[] DEFAULT ARRAY['urgent', 'asap', 'emergency', 'critical'],
  value_keywords TEXT[] DEFAULT ARRAY['budget', 'purchase', 'contract', 'deal', 'buy'],
  vip_keywords TEXT[] DEFAULT ARRAY['CEO', 'founder', 'director', 'VP', 'president'],
  custom_keywords TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Contact capture settings
  contact_capture_enabled BOOLEAN DEFAULT true,
  contact_capture_message TEXT DEFAULT 'This sounds important! I''d love to connect you with my creator. Could you share your email or phone so they can reach out directly?',
  
  -- Configuration
  is_active BOOLEAN DEFAULT true
);

-- Create conversation_captures table for collected contact information
CREATE TABLE conversation_captures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id),
  advisor_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Contact information
  email TEXT,
  phone TEXT,
  name TEXT,
  
  -- Context
  trigger_reason TEXT,
  conversation_score INTEGER,
  message_count INTEGER,
  
  -- Status
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'converted', 'archived')),
  notes TEXT
);

-- Add RLS policies for escalation_rules
ALTER TABLE escalation_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own escalation rules" ON escalation_rules
  FOR ALL USING (
    advisor_id IN (
      SELECT id FROM advisors WHERE user_id = auth.uid()
    )
  );

-- Add RLS policies for conversation_captures  
ALTER TABLE conversation_captures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own conversation captures" ON conversation_captures
  FOR ALL USING (
    advisor_id IN (
      SELECT id FROM advisors WHERE user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX idx_messages_score ON messages(score);
CREATE INDEX idx_messages_intent ON messages(intent);
CREATE INDEX idx_escalation_rules_advisor_id ON escalation_rules(advisor_id);
CREATE INDEX idx_conversation_captures_advisor_id ON conversation_captures(advisor_id);
CREATE INDEX idx_conversation_captures_status ON conversation_captures(status);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_escalation_rules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_escalation_rules_updated_at_trigger
  BEFORE UPDATE ON escalation_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_escalation_rules_updated_at();
