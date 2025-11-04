
export interface VoiceTrait {
  name: string;
  description?: string;
  color?: string;
}

export interface AgentChannel {
  id: string;
  name: string;
  type: 'discord' | 'slack' | 'telegram' | 'whatsapp' | 'sms' | 'email' | 'web';
  config: Record<string, any>;
}

export interface AgentChannelConfig {
  enabled: boolean;
  details?: string;
  config?: Record<string, any>;
}

export interface SocialLinks {
  x?: string;
  website?: string;
  telegram?: string;
}

export interface AgentType {
  twitter_url?: string;
  website_url?: string;
  crypto_wallet?: string;
  background_image_url?: string;
  welcome_message?: string;
  social_links?: SocialLinks;
  id: string;
  name: string;
  description: string;
  type: 'Math Tutor' | 'Science Tutor' | 'Language Tutor' | 'General Tutor' | 'History Tutor' | 'Art Tutor';
  status: 'active' | 'inactive' | 'training' | 'draft';
  createdAt: string;
  updatedAt: string;
  avatar?: string;
  prompt?: string;
  subject?: string;
  title?: string; // Add title field for advisors
  gradeLevel?: string;
  learningObjective?: string;
  model?: string;
  voice?: string;
  voiceProvider?: string;
  customVoiceId?: string;
  interactions?: number;
  studentsSaved?: number;
  helpfulnessScore?: number;
  avmScore?: number;
  csat?: number;
  performance?: number;
  channels?: string[];
  channelConfigs?: Record<string, AgentChannelConfig>;
  isPersonal?: boolean;
  phone?: string;
  email?: string;
  purpose?: string;
  teachingStyle?: string;
  customSubject?: string;
  voiceTraits?: VoiceTrait[];
  is_featured?: boolean; // Add the missing is_featured property
  sim_type?: 'historical' | 'living'; // Add sim_type for filtering
  custom_url?: string; // Add custom_url for living sims
  is_official?: boolean; // Add is_official for official historical sims
  price?: number; // Price in $SimAI tokens
  marketplace_category?: string; // Category for marketplace filtering (crypto, historical, etc.)
  sim_category?: string; // Sim functionality type: "Chat" or "Contact Me"
  auto_description?: string; // Auto-generated short description based on system prompt
  x402_price?: number; // x402 payment price in USDC (e.g., 0.01 for $0.01)
  x402_wallet?: string; // EVM-compatible wallet address for x402 payments
  x402_enabled?: boolean; // Whether x402 payment is required
  is_verified?: boolean; // Whether the sim has been verified through their X account
  integrations?: any; // Array of enabled integration IDs (e.g., ['pumpfun', 'solana-explorer', 'x-analyzer'])
  verification_status?: boolean; // X account verification status (false = pending, true = verified)
  verification_post_required?: string; // The text that must be posted for verification
  verification_deadline?: string; // ISO date string for verification deadline
  verified_at?: string; // ISO date string when verification was completed
  avatar_url?: string; // Avatar URL from database
}

export interface PublicAgentType {
  id: string;
  name: string;
  description: string;
  avatar?: string;
}
