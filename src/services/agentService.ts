
import { supabase } from '@/integrations/supabase/client';
import { AgentType, VoiceTrait, AgentChannelConfig } from '@/types/agent';

// Type guard functions for safe JSON conversion
const isVoiceTraitsArray = (value: any): value is VoiceTrait[] => {
  return Array.isArray(value) && value.every(item => 
    typeof item === 'object' && item !== null && 
    typeof item.name === 'string'
  );
};

const isChannelConfigsObject = (value: any): value is Record<string, AgentChannelConfig> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const isChannelsArray = (value: any): value is string[] => {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
};

// Mock data for development/fallback when Supabase is not available
const mockAgents: AgentType[] = [
  {
    id: 'mock-1',
    name: 'Dr. Sarah Chen',
    description: 'An experienced mathematics tutor specializing in algebra and calculus.',
    type: 'Math Tutor',
    subject: 'Mathematics',
    gradeLevel: 'High School',
    status: 'active',
    avatar: '',
    email: 'sarah@example.com',
    phone: '+1-555-0123',
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
    // For marketplace view, fetch all public tutors regardless of authentication
    if (filter === 'all-agents') {
      const { data, error } = await supabase
        .from('tutors')
        .select('*')
        .eq('status', 'active'); // Only show active tutors in marketplace

      if (error) {
        console.error('Error fetching public tutors:', error);
        throw new Error(error.message);
      }

      return data.map(tutor => ({
        id: tutor.id,
        name: tutor.name,
        description: tutor.description,
        type: tutor.type as AgentType['type'],
        subject: tutor.subject,
        gradeLevel: tutor.grade_level,
        status: tutor.status as AgentType['status'],
        avatar: tutor.avatar,
        email: tutor.email,
        phone: tutor.phone,
        createdAt: tutor.created_at,
        updatedAt: tutor.updated_at,
        isPersonal: tutor.is_personal,
        performance: tutor.performance,
        csat: tutor.csat,
        avmScore: tutor.avm_score,
        helpfulnessScore: tutor.helpfulness_score,
        studentsSaved: tutor.students_saved,
        interactions: tutor.interactions,
        voiceTraits: isVoiceTraitsArray(tutor.voice_traits) ? tutor.voice_traits : [],
        channelConfigs: isChannelConfigsObject(tutor.channel_configs) ? tutor.channel_configs : {},
        channels: isChannelsArray(tutor.channels) ? tutor.channels : [],
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
    }

    // For authenticated user's own tutors
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from('tutors')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching user tutors:', error);
      throw new Error(error.message);
    }

    return data.map(tutor => ({
      id: tutor.id,
      name: tutor.name,
      description: tutor.description,
      type: tutor.type as AgentType['type'],
      subject: tutor.subject,
      gradeLevel: tutor.grade_level,
      status: tutor.status as AgentType['status'],
      avatar: tutor.avatar,
      email: tutor.email,
      phone: tutor.phone,
      createdAt: tutor.created_at,
      updatedAt: tutor.updated_at,
      isPersonal: tutor.is_personal,
      performance: tutor.performance,
      csat: tutor.csat,
      avmScore: tutor.avm_score,
      helpfulnessScore: tutor.helpfulness_score,
      studentsSaved: tutor.students_saved,
      interactions: tutor.interactions,
      voiceTraits: isVoiceTraitsArray(tutor.voice_traits) ? tutor.voice_traits : [],
      channelConfigs: isChannelConfigsObject(tutor.channel_configs) ? tutor.channel_configs : {},
      channels: isChannelsArray(tutor.channels) ? tutor.channels : [],
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
      type: data.type as AgentType['type'],
      subject: data.subject,
      gradeLevel: data.grade_level,
      status: data.status as AgentType['status'],
      avatar: data.avatar,
      email: data.email,
      phone: data.phone,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      isPersonal: data.is_personal,
      performance: data.performance,
      csat: data.csat,
      avmScore: data.avm_score,
      helpfulnessScore: data.helpfulness_score,
      studentsSaved: data.students_saved,
      interactions: data.interactions,
      voiceTraits: isVoiceTraitsArray(data.voice_traits) ? data.voice_traits : [],
      channelConfigs: isChannelConfigsObject(data.channel_configs) ? data.channel_configs : {},
      channels: isChannelsArray(data.channels) ? data.channels : [],
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
    // Convert AgentType updates to database schema
    const dbUpdates: any = {
      ...(updates.name && { name: updates.name }),
      ...(updates.description && { description: updates.description }),
      ...(updates.type && { type: updates.type }),
      ...(updates.subject && { subject: updates.subject }),
      ...(updates.gradeLevel && { grade_level: updates.gradeLevel }),
      ...(updates.status && { status: updates.status }),
      ...(updates.avatar && { avatar: updates.avatar }),
      ...(updates.email && { email: updates.email }),
      ...(updates.phone && { phone: updates.phone }),
      ...(updates.isPersonal !== undefined && { is_personal: updates.isPersonal }),
      ...(updates.performance && { performance: updates.performance }),
      ...(updates.csat && { csat: updates.csat }),
      ...(updates.avmScore && { avm_score: updates.avmScore }),
      ...(updates.helpfulnessScore && { helpfulness_score: updates.helpfulnessScore }),
      ...(updates.studentsSaved && { students_saved: updates.studentsSaved }),
      ...(updates.interactions && { interactions: updates.interactions }),
      ...(updates.voiceTraits && { voice_traits: updates.voiceTraits }),
      ...(updates.channelConfigs && { channel_configs: updates.channelConfigs }),
      ...(updates.channels && { channels: updates.channels }),
      ...(updates.teachingStyle && { teaching_style: updates.teachingStyle }),
      ...(updates.customSubject && { custom_subject: updates.customSubject }),
      ...(updates.learningObjective && { learning_objective: updates.learningObjective }),
      ...(updates.purpose && { purpose: updates.purpose }),
      ...(updates.prompt && { prompt: updates.prompt }),
      ...(updates.model && { model: updates.model }),
      ...(updates.voice && { voice: updates.voice }),
      ...(updates.voiceProvider && { voice_provider: updates.voiceProvider }),
      ...(updates.customVoiceId && { custom_voice_id: updates.customVoiceId })
    };

    const { data, error } = await supabase
      .from('tutors')
      .update(dbUpdates)
      .eq('id', agentId)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating tutor:', error);
      throw new Error(error.message);
    }

    // Convert back to AgentType format
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      type: data.type as AgentType['type'],
      subject: data.subject,
      gradeLevel: data.grade_level,
      status: data.status as AgentType['status'],
      avatar: data.avatar,
      email: data.email,
      phone: data.phone,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      isPersonal: data.is_personal,
      performance: data.performance,
      csat: data.csat,
      avmScore: data.avm_score,
      helpfulnessScore: data.helpfulness_score,
      studentsSaved: data.students_saved,
      interactions: data.interactions,
      voiceTraits: isVoiceTraitsArray(data.voice_traits) ? data.voice_traits : [],
      channelConfigs: isChannelConfigsObject(data.channel_configs) ? data.channel_configs : {},
      channels: isChannelsArray(data.channels) ? data.channels : [],
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
    console.error('Error updating tutor:', error);
    return null;
  }
};

export const createAgent = async (agent: Omit<AgentType, 'id' | 'createdAt' | 'updatedAt'>): Promise<AgentType | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be authenticated to create a tutor');
    }

    // Convert AgentType to database schema with proper JSON casting
    const dbAgent = {
      name: agent.name,
      description: agent.description,
      type: agent.type,
      subject: agent.subject || null,
      grade_level: agent.gradeLevel || null,
      status: agent.status,
      avatar: agent.avatar || null,
      email: agent.email || null,
      phone: agent.phone || null,
      user_id: user.id,
      is_personal: agent.isPersonal || true,
      performance: agent.performance || null,
      csat: agent.csat || null,
      avm_score: agent.avmScore || null,
      helpfulness_score: agent.helpfulnessScore || null,
      students_saved: agent.studentsSaved || null,
      interactions: agent.interactions || null,
      voice_traits: JSON.stringify(agent.voiceTraits || []),
      channel_configs: JSON.stringify(agent.channelConfigs || {}),
      channels: JSON.stringify(agent.channels || []),
      teaching_style: agent.teachingStyle || null,
      custom_subject: agent.customSubject || null,
      learning_objective: agent.learningObjective || null,
      purpose: agent.purpose || null,
      prompt: agent.prompt || null,
      model: agent.model || null,
      voice: agent.voice || null,
      voice_provider: agent.voiceProvider || null,
      custom_voice_id: agent.customVoiceId || null
    };

    const { data, error } = await supabase
      .from('tutors')
      .insert(dbAgent)
      .select('*')
      .single();

    if (error) {
      console.error('Error creating tutor:', error);
      throw new Error(error.message);
    }

    // Convert back to AgentType format
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      type: data.type as AgentType['type'],
      subject: data.subject,
      gradeLevel: data.grade_level,
      status: data.status as AgentType['status'],
      avatar: data.avatar,
      email: data.email,
      phone: data.phone,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      isPersonal: data.is_personal,
      performance: data.performance,
      csat: data.csat,
      avmScore: data.avm_score,
      helpfulnessScore: data.helpfulness_score,
      studentsSaved: data.students_saved,
      interactions: data.interactions,
      voiceTraits: isVoiceTraitsArray(data.voice_traits) ? data.voice_traits : [],
      channelConfigs: isChannelConfigsObject(data.channel_configs) ? data.channel_configs : {},
      channels: isChannelsArray(data.channels) ? data.channels : [],
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
