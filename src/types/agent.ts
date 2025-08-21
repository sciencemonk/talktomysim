export interface VoiceTrait {
  name: string;
  description: string;
}

export interface AgentChannel {
  id: string;
  name: string;
  type: 'discord' | 'slack' | 'telegram' | 'whatsapp' | 'sms' | 'email' | 'web';
  config: Record<string, any>;
}

export interface AgentType {
  id: string;
  name: string;
  description: string;
  type: 'Math Tutor' | 'Science Tutor' | 'Language Tutor' | 'General Tutor' | 'History Tutor' | 'Art Tutor';
  status: 'active' | 'inactive' | 'training';
  createdAt: string;
  updatedAt: string;
  avatar?: string;
  prompt?: string;
  subject?: string;
  title?: string; // Add title field for advisors
  gradeLevel?: string;
  learningObjective?: string;
  model?: string;
  interactions?: number;
  studentsSaved?: number;
  helpfulnessScore?: number;
  avmScore?: number;
  csat?: number;
  performance?: number;
  channels?: AgentChannel[];
  channelConfigs?: Record<string, any>;
  isPersonal?: boolean;
  voiceTraits?: VoiceTrait[];
}

export interface PublicAgentType {
  id: string;
  name: string;
  description: string;
  avatar?: string;
}
