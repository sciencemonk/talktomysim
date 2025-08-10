
export type AgentStatus = "active" | "inactive" | "draft";
export type AgentTypeCategory = 
  | "Math Tutor" 
  | "Science Tutor" 
  | "Language Arts Tutor" 
  | "History Tutor" 
  | "Reading Assistant" 
  | "Homework Helper" 
  | "Study Buddy" 
  | "Quiz Master" 
  | "Writing Coach" 
  | "General Tutor";

export interface AgentChannelConfig {
  enabled: boolean;
  details?: string;
  config?: Record<string, any>;
}

export interface VoiceTrait {
  name: string;
  color?: string;
}

export interface AgentType {
  id: string;
  name: string;
  description: string;
  type: AgentTypeCategory;
  status: AgentStatus;
  createdAt: string;
  updatedAt?: string;
  model?: string;
  voice?: string;
  voiceProvider?: string;
  customVoiceId?: string;
  voiceTraits?: VoiceTrait[];
  interactions?: number;
  studentsSaved?: number;
  helpfulnessScore?: number;
  channels?: string[];
  channelConfigs?: Record<string, AgentChannelConfig>;
  isPersonal?: boolean;
  phone?: string;
  email?: string;
  avatar?: string;
  purpose?: string;
  prompt?: string;
  subject?: string;
  gradeLevel?: string;
  teachingStyle?: string;
  customSubject?: string;
}
