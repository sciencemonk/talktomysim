
import { supabase } from '@/integrations/supabase/client';
import { AgentType } from '@/types/agent';

// Fetch agents from Supabase
export const fetchAgents = async (filter: string): Promise<AgentType[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  let query = supabase
    .from('tutors')
    .select('*')
    .eq('user_id', user.id);

  // Apply filters
  if (filter === 'my-agents') {
    query = query.eq('is_personal', true);
  } else if (filter === 'team-agents') {
    query = query.eq('is_personal', false);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching tutors:', error);
    throw new Error('Failed to fetch tutors');
  }

  // Transform the data to match AgentType interface
  return (data || []).map(tutor => ({
    id: tutor.id,
    name: tutor.name,
    description: tutor.description || '',
    type: tutor.type as any,
    status: tutor.status as any,
    createdAt: tutor.created_at.split('T')[0],
    updatedAt: tutor.updated_at?.split('T')[0],
    interactions: tutor.interactions || 0,
    isPersonal: tutor.is_personal,
    model: tutor.model || 'GPT-4',
    channels: Array.isArray(tutor.channels) ? tutor.channels : [],
    channelConfigs: tutor.channel_configs || {},
    avatar: tutor.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${tutor.id}`,
    purpose: tutor.purpose || '',
    prompt: tutor.prompt || '',
    subject: tutor.subject || '',
    gradeLevel: tutor.grade_level || '',
    teachingStyle: tutor.teaching_style || '',
    customSubject: tutor.custom_subject || '',
    learningObjective: tutor.learning_objective || '',
    voice: tutor.voice || '',
    voiceProvider: tutor.voice_provider || '',
    studentsSaved: tutor.students_saved || 0,
    helpfulnessScore: tutor.helpfulness_score || 0,
    email: tutor.email || `${tutor.name.toLowerCase().replace(/\s+/g, '')}@tutors.ai`,
    phone: tutor.phone || ''
  }));
};

// Fetch agent by ID from Supabase
export const fetchAgentById = async (agentId: string): Promise<AgentType> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('tutors')
    .select('*')
    .eq('id', agentId)
    .eq('user_id', user.id)
    .single();

  if (error || !data) {
    console.error('Error fetching tutor:', error);
    throw new Error(`Tutor with id ${agentId} not found`);
  }

  // Transform the data to match AgentType interface
  return {
    id: data.id,
    name: data.name,
    description: data.description || '',
    type: data.type as any,
    status: data.status as any,
    createdAt: data.created_at.split('T')[0],
    updatedAt: data.updated_at?.split('T')[0],
    interactions: data.interactions || 0,
    isPersonal: data.is_personal,
    model: data.model || 'GPT-4',
    channels: Array.isArray(data.channels) ? data.channels : [],
    channelConfigs: data.channel_configs || {},
    avatar: data.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${data.id}`,
    purpose: data.purpose || '',
    prompt: data.prompt || '',
    subject: data.subject || '',
    gradeLevel: data.grade_level || '',
    teachingStyle: data.teaching_style || '',
    customSubject: data.custom_subject || '',
    learningObjective: data.learning_objective || '',
    voice: data.voice || '',
    voiceProvider: data.voice_provider || '',
    studentsSaved: data.students_saved || 0,
    helpfulnessScore: data.helpfulness_score || 0,
    email: data.email || `${data.name.toLowerCase().replace(/\s+/g, '')}@tutors.ai`,
    phone: data.phone || ''
  };
};

// Create a new agent in Supabase
export const createAgent = async (agentData: Omit<AgentType, 'id' | 'createdAt' | 'interactions'>): Promise<AgentType> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const tutorData = {
    user_id: user.id,
    name: agentData.name,
    description: agentData.description,
    type: agentData.type,
    status: agentData.status || 'draft',
    subject: agentData.subject,
    grade_level: agentData.gradeLevel,
    teaching_style: agentData.teachingStyle,
    custom_subject: agentData.customSubject,
    learning_objective: agentData.learningObjective,
    purpose: agentData.purpose,
    prompt: agentData.prompt,
    model: agentData.model || 'GPT-4',
    voice: agentData.voice,
    voice_provider: agentData.voiceProvider,
    avatar: agentData.avatar,
    phone: agentData.phone,
    email: agentData.email,
    channels: agentData.channels || [],
    channel_configs: agentData.channelConfigs || {},
    is_personal: agentData.isPersonal !== false
  };

  const { data, error } = await supabase
    .from('tutors')
    .insert(tutorData)
    .select()
    .single();

  if (error) {
    console.error('Error creating tutor:', error);
    throw new Error('Failed to create tutor');
  }

  // Transform the response back to AgentType
  return {
    id: data.id,
    name: data.name,
    description: data.description || '',
    type: data.type as any,
    status: data.status as any,
    createdAt: data.created_at.split('T')[0],
    updatedAt: data.updated_at?.split('T')[0],
    interactions: 0,
    isPersonal: data.is_personal,
    model: data.model || 'GPT-4',
    channels: Array.isArray(data.channels) ? data.channels : [],
    channelConfigs: data.channel_configs || {},
    avatar: data.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${data.id}`,
    purpose: data.purpose || '',
    prompt: data.prompt || '',
    subject: data.subject || '',
    gradeLevel: data.grade_level || '',
    teachingStyle: data.teaching_style || '',
    customSubject: data.custom_subject || '',
    learningObjective: data.learning_objective || '',
    voice: data.voice || '',
    voiceProvider: data.voice_provider || '',
    studentsSaved: 0,
    helpfulnessScore: 0,
    email: data.email || `${data.name.toLowerCase().replace(/\s+/g, '')}@tutors.ai`,
    phone: data.phone || ''
  };
};

// Update an agent in Supabase
export const updateAgent = async (agentId: string, agentData: Partial<AgentType>): Promise<AgentType> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const tutorData: any = {};
  
  // Map AgentType fields to database columns
  if (agentData.name) tutorData.name = agentData.name;
  if (agentData.description !== undefined) tutorData.description = agentData.description;
  if (agentData.type) tutorData.type = agentData.type;
  if (agentData.status) tutorData.status = agentData.status;
  if (agentData.subject !== undefined) tutorData.subject = agentData.subject;
  if (agentData.gradeLevel !== undefined) tutorData.grade_level = agentData.gradeLevel;
  if (agentData.teachingStyle !== undefined) tutorData.teaching_style = agentData.teachingStyle;
  if (agentData.customSubject !== undefined) tutorData.custom_subject = agentData.customSubject;
  if (agentData.learningObjective !== undefined) tutorData.learning_objective = agentData.learningObjective;
  if (agentData.purpose !== undefined) tutorData.purpose = agentData.purpose;
  if (agentData.prompt !== undefined) tutorData.prompt = agentData.prompt;
  if (agentData.model) tutorData.model = agentData.model;
  if (agentData.voice !== undefined) tutorData.voice = agentData.voice;
  if (agentData.voiceProvider !== undefined) tutorData.voice_provider = agentData.voiceProvider;
  if (agentData.avatar !== undefined) tutorData.avatar = agentData.avatar;
  if (agentData.phone !== undefined) tutorData.phone = agentData.phone;
  if (agentData.email !== undefined) tutorData.email = agentData.email;
  if (agentData.channels) tutorData.channels = agentData.channels;
  if (agentData.channelConfigs) tutorData.channel_configs = agentData.channelConfigs;
  if (agentData.isPersonal !== undefined) tutorData.is_personal = agentData.isPersonal;

  const { data, error } = await supabase
    .from('tutors')
    .update(tutorData)
    .eq('id', agentId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error || !data) {
    console.error('Error updating tutor:', error);
    throw new Error('Failed to update tutor');
  }

  // Transform the response back to AgentType
  return {
    id: data.id,
    name: data.name,
    description: data.description || '',
    type: data.type as any,
    status: data.status as any,
    createdAt: data.created_at.split('T')[0],
    updatedAt: data.updated_at?.split('T')[0],
    interactions: data.interactions || 0,
    isPersonal: data.is_personal,
    model: data.model || 'GPT-4',
    channels: Array.isArray(data.channels) ? data.channels : [],
    channelConfigs: data.channel_configs || {},
    avatar: data.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${data.id}`,
    purpose: data.purpose || '',
    prompt: data.prompt || '',
    subject: data.subject || '',
    gradeLevel: data.grade_level || '',
    teachingStyle: data.teaching_style || '',
    customSubject: data.custom_subject || '',
    learningObjective: data.learning_objective || '',
    voice: data.voice || '',
    voiceProvider: data.voice_provider || '',
    studentsSaved: data.students_saved || 0,
    helpfulnessScore: data.helpfulness_score || 0,
    email: data.email || `${data.name.toLowerCase().replace(/\s+/g, '')}@tutors.ai`,
    phone: data.phone || ''
  };
};

// Delete an agent from Supabase
export const deleteAgent = async (agentId: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('tutors')
    .delete()
    .eq('id', agentId)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error deleting tutor:', error);
    throw new Error('Failed to delete tutor');
  }
};
