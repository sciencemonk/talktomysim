-- Add verification status fields to advisors table
ALTER TABLE public.advisors 
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'failed')),
ADD COLUMN IF NOT EXISTS verification_post_required TEXT DEFAULT 'Verify me on $SIMAI',
ADD COLUMN IF NOT EXISTS verification_deadline TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE;

-- Create index for pending verifications
CREATE INDEX IF NOT EXISTS idx_advisors_verification_status ON public.advisors(verification_status, verification_deadline);

COMMENT ON COLUMN public.advisors.verification_status IS 'Status of X account verification: pending, verified, or failed';
COMMENT ON COLUMN public.advisors.verification_post_required IS 'The exact text that must be posted on X for verification';
COMMENT ON COLUMN public.advisors.verification_deadline IS 'Deadline for posting verification (24 hours from creation)';
COMMENT ON COLUMN public.advisors.verified_at IS 'Timestamp when the agent was verified';