-- Create sims table for X-authenticated agents
CREATE TABLE sims (
  -- Identity
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Core Info
  name text NOT NULL,
  description text,
  prompt text NOT NULL,
  welcome_message text,
  
  -- X Integration
  x_username text NOT NULL UNIQUE,
  x_display_name text,
  twitter_url text NOT NULL,
  avatar_url text,
  
  -- Solana Integration
  crypto_wallet text NOT NULL,
  
  -- Verification
  is_verified boolean NOT NULL DEFAULT false,
  verification_status boolean NOT NULL DEFAULT false,
  verified_at timestamptz,
  
  -- Access Control
  edit_code text NOT NULL,
  custom_url text UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  is_public boolean NOT NULL DEFAULT true,
  
  -- MCP Integrations
  integrations jsonb DEFAULT '[]'::jsonb,
  
  -- Metadata
  social_links jsonb,
  training_completed boolean DEFAULT false,
  training_post_count integer DEFAULT 0,
  
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_sims_user_id ON sims(user_id);
CREATE INDEX idx_sims_x_username ON sims(x_username);
CREATE INDEX idx_sims_custom_url ON sims(custom_url);
CREATE INDEX idx_sims_is_public ON sims(is_public) WHERE is_public = true;

-- Enable RLS
ALTER TABLE sims ENABLE ROW LEVEL SECURITY;

-- Anyone can view public SIMs
CREATE POLICY "Public SIMs are viewable by everyone"
  ON sims FOR SELECT
  USING (is_public = true);

-- Users can view their own SIMs
CREATE POLICY "Users can view own SIMs"
  ON sims FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own SIMs
CREATE POLICY "Users can create own SIMs"
  ON sims FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own SIMs
CREATE POLICY "Users can update own SIMs"
  ON sims FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own SIMs
CREATE POLICY "Users can delete own SIMs"
  ON sims FOR DELETE
  USING (auth.uid() = user_id);

-- Updated at trigger
CREATE TRIGGER update_sims_updated_at
  BEFORE UPDATE ON sims
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add optional sim_id to conversations table to support both old and new system
ALTER TABLE conversations ADD COLUMN sim_id uuid REFERENCES sims(id) ON DELETE CASCADE;
CREATE INDEX idx_conversations_sim_id ON conversations(sim_id);

-- Add optional sim_id to contact_messages table
ALTER TABLE contact_messages ADD COLUMN sim_id uuid REFERENCES sims(id) ON DELETE CASCADE;
CREATE INDEX idx_contact_messages_sim_id ON contact_messages(sim_id);