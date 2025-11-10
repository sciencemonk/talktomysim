export interface Sim {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  prompt: string;
  creator_prompt: string | null;
  stranger_prompt: string | null;
  sim_to_sim_prompt: string | null;
  welcome_message: string | null;
  x_username: string;
  x_display_name: string | null;
  twitter_url: string;
  avatar_url: string | null;
  crypto_wallet: string;
  is_verified: boolean;
  verification_status: boolean;
  verified_at: string | null;
  edit_code: string;
  custom_url: string | null;
  is_active: boolean;
  is_public: boolean;
  integrations: any;
  social_links: any;
  training_completed: boolean;
  training_post_count: number;
  created_at: string;
  updated_at: string;
}
