
export interface Advisor {
  id: string;
  name: string;
  title?: string;
  description?: string;
  prompt: string;
  avatar_url?: string;
  category?: string;
  is_active: boolean;
  background_content?: string;
  knowledge_summary?: string;
  created_at: string;
  updated_at: string;
}
