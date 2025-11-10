export interface Sim {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  prompt: string;
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
  integrations: string[];
  social_links: {
    x_username?: string;
    x_display_name?: string;
    profile_image_url?: string;
    trained?: boolean;
    trainedAt?: string;
    trainingPostCount?: number;
    tweet_history?: any[];
    last_trained?: string;
    tweets_count?: number;
  } | null;
  training_completed: boolean;
  training_post_count: number;
  created_at: string;
  updated_at: string;
}
