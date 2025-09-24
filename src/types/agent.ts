
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

export interface AgentType {
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
}

export interface PublicAgentType {
  id: string;
  name: string;
  description: string;
  avatar?: string;
}
