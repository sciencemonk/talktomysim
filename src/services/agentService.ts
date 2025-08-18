import { supabase } from '@/integrations/supabase/client';
import { AgentType } from '@/types/agent';

// Mock data for development/fallback when Supabase is not available
const mockAgents: AgentType[] = [
  {
    id: 'mock-1',
    name: 'Dr. Sarah Chen',
    description: 'An experienced mathematics tutor specializing in algebra and calculus.',
    type: 'Mathematics Tutor',
    subject: 'Mathematics',
    gradeLevel: 'High School',
    status: 'active',
    avatar: '',
    email: 'sarah@example.com',
    phone: '+1-555-0123',
    userId: 'mock-user-1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isPersonal: false,
    performance: 4.8,
    csat: 4.9,
    avmScore: 4.7,
    helpfulnessScore: 4.8,
    studentsSaved: 150,
    interactions: 1250,
    voiceTraits: [],
    channelConfigs: {},
    channels: ['chat'],
    teachingStyle: 'Patient and encouraging',
    customSubject: null,
    learningObjective: 'Help students master mathematical concepts',
    purpose: 'Educational support',
    prompt: 'You are Dr. Sarah Chen, a mathematics tutor...',
    model: 'GPT-4',
    voice: null,
    voiceProvider: null,
    customVoiceId: null
  },
  {
    id: 'mock-2',
    name: 'Prof. Michael Rodriguez',
    description: 'A science educator with expertise in physics and chemistry.',
    type: 'Science Tutor',
    subject: 'Science',
    gradeLevel: 'College',
    status: 'active',
    avatar: '',
    email: 'michael@example.com',
    phone: '+1-555-0124',
    userId: 'mock-user-2',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isPersonal: false,
    performance: 4.6,
    csat: 4.7,
    avmScore: 4.5,
    helpfulnessScore: 4.6,
    studentsSaved: 200,
    interactions: 1800,
    voiceTraits: [],
    channelConfigs: {},
    channels: ['chat'],
    teachingStyle: 'Interactive and hands-on',
    customSubject: null,
    learningObjective: 'Make science accessible and engaging',
    purpose: 'Educational support',
    prompt: 'You are Prof. Michael Rodriguez, a science tutor...',
    model: 'GPT-4',
    voice: null,
    voiceProvider: null,
    customVoiceId: null
  }
];

export const fetchAgents = async (filter: string = 'all-agents'): Promise<AgentType[]> => {
  try {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Return empty array for unauthenticated users since they can't see private tutors
      return [];
    }

    const { data, error } = await supabase
      .from('tutors')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching tutors:', error);
      throw new Error(error.message);
    }

    return data.map(tutor => ({
      id: tutor.id,
      name: tutor.name,
      description: tutor.description,
      type: tutor.type,
      subject: tutor.subject,
      gradeLevel: tutor.grade_level,
      status: tutor.status,
      avatar: tutor.avatar,
      email: tutor.email,
      phone: tutor.phone,
      userId: tutor.user_id,
      createdAt: tutor.created_at,
      updatedAt: tutor.updated_at,
      isPersonal: tutor.is_personal,
      performance: tutor.performance,
      csat: tutor.csat,
      avmScore: tutor.avm_score,
      helpfulnessScore: tutor.helpfulness_score,
      studentsSaved: tutor.students_saved,
      interactions: tutor.interactions,
      voiceTraits: tutor.voice_traits || [],
      channelConfigs: tutor.channel_configs || {},
      channels: tutor.channels || [],
      teachingStyle: tutor.teaching_style,
      customSubject: tutor.custom_subject,
      learningObjective: tutor.learning_objective,
      purpose: tutor.purpose,
      prompt: tutor.prompt,
      model: tutor.model,
      voice: tutor.voice,
      voiceProvider: tutor.voice_provider,
      customVoiceId: tutor.custom_voice_id
    })) || [];
  } catch (error) {
    console.error('Error in fetchAgents:', error);
    throw error;
  }
};

export const fetchAgentById = async (id: string): Promise<AgentType> => {
  try {
    // First try to get from database without authentication requirement
    // This allows public access to shared tutors
    const { data, error } = await supabase
      .from('tutors')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching tutor from database:', error);
      
      // Fallback to mock data for demonstration purposes
      const mockAgent = mockAgents.find(agent => agent.id === id);
      if (mockAgent) {
        return mockAgent;
      }
      
      throw new Error('Tutor not found');
    }

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      type: data.type,
      subject: data.subject,
      gradeLevel: data.grade_level,
      status: data.status,
      avatar: data.avatar,
      email: data.email,
      phone: data.phone,
      userId: data.user_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      isPersonal: data.is_personal,
      performance: data.performance,
      csat: data.csat,
      avmScore: data.avm_score,
      helpfulnessScore: data.helpfulness_score,
      studentsSaved: data.students_saved,
      interactions: data.interactions,
      voiceTraits: data.voice_traits || [],
      channelConfigs: data.channel_configs || {},
      channels: data.channels || [],
      teachingStyle: data.teaching_style,
      customSubject: data.custom_subject,
      learningObjective: data.learning_objective,
      purpose: data.purpose,
      prompt: data.prompt,
      model: data.model,
      voice: data.voice,
      voiceProvider: data.voice_provider,
      customVoiceId: data.custom_voice_id
    };
  } catch (error) {
    console.error('Error in fetchAgentById:', error);
    throw error;
  }
};

export const updateAgent = async (agentId: string, updates: Partial<AgentType>): Promise<AgentType | null> => {
  try {
    const { data, error } = await supabase
      .from('tutors')
      .update(updates)
      .eq('id', agentId)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating tutor:', error);
      throw new Error(error.message);
    }

    return data as AgentType;
  } catch (error) {
    console.error('Error updating tutor:', error);
    return null;
  }
};

export const createAgent = async (agent: Omit<AgentType, 'id' | 'createdAt' | 'updatedAt'>): Promise<AgentType | null> => {
  try {
    const { data, error } = await supabase
      .from('tutors')
      .insert([agent])
      .select('*')
      .single();

    if (error) {
      console.error('Error creating tutor:', error);
      throw new Error(error.message);
    }

    return data as AgentType;
  } catch (error) {
    console.error('Error creating tutor:', error);
    return null;
  }
};

export const deleteAgent = async (agentId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('tutors')
      .delete()
      .eq('id', agentId);

    if (error) {
      console.error('Error deleting tutor:', error);
      throw new Error(error.message);
    }

    return true;
  } catch (error) {
    console.error('Error deleting tutor:', error);
    return false;
  }
};
