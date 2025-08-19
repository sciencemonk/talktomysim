
import { supabase } from "@/integrations/supabase/client";
import { AgentType, VoiceTrait, AgentChannelConfig } from "@/types/agent";

export const fetchAgents = async (filter: string = 'all-agents'): Promise<AgentType[]> => {
  console.log("Fetching tutors with filter:", filter);
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.log("No authenticated user found");
    return [];
  }

  let query = supabase
    .from('tutors')
    .select('*')
    .eq('user_id', user.id);

  // Apply additional filters based on the filter parameter
  switch (filter) {
    case 'my-agents':
      query = query.eq('is_personal', true);
      break;
    case 'team-agents':
      query = query.eq('is_personal', false);
      break;
    // 'all-agents' shows everything for this user
  }

  const { data: tutors, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching tutors:", error);
    throw new Error(`Failed to fetch tutors: ${error.message}`);
  }

  console.log("Fetched tutors:", tutors);

  // Transform the data to match AgentType interface with proper type handling
  return tutors?.map(tutor => ({
    id: tutor.id,
    name: tutor.name,
    description: tutor.description || '',
    type: tutor.type as any,
    status: tutor.status as any,
    createdAt: tutor.created_at,
    updatedAt: tutor.updated_at,
    model: tutor.model,
    voice: tutor.voice,
    voiceProvider: tutor.voice_provider,
    customVoiceId: tutor.custom_voice_id,
    voiceTraits: Array.isArray(tutor.voice_traits) ? tutor.voice_traits as VoiceTrait[] : [],
    interactions: tutor.interactions || 0,
    studentsSaved: tutor.students_saved || 0,
    helpfulnessScore: tutor.helpfulness_score || 0,
    avmScore: tutor.avm_score || 0,
    csat: tutor.csat || 0,
    performance: tutor.performance || 0,
    channels: Array.isArray(tutor.channels) ? tutor.channels as string[] : [],
    channelConfigs: typeof tutor.channel_configs === 'object' && tutor.channel_configs ? tutor.channel_configs as Record<string, AgentChannelConfig> : {},
    isPersonal: tutor.is_personal,
    phone: tutor.phone,
    email: tutor.email,
    avatar: tutor.avatar,
    purpose: tutor.purpose,
    prompt: tutor.prompt,
    subject: tutor.subject,
    gradeLevel: tutor.grade_level,
    teachingStyle: tutor.teaching_style,
    customSubject: tutor.custom_subject,
    learningObjective: tutor.learning_objective
  })) || [];
};

export const fetchAgentById = async (id: string): Promise<AgentType> => {
  console.log("Fetching tutor by ID:", id);
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User must be authenticated to fetch tutor details");
  }

  const { data: tutor, error } = await supabase
    .from('tutors')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) {
    console.error("Error fetching tutor:", error);
    throw new Error(`Failed to fetch tutor: ${error.message}`);
  }

  if (!tutor) {
    throw new Error("Tutor not found or access denied");
  }

  console.log("Fetched tutor:", tutor);

  // Transform the data to match AgentType interface with proper type handling
  return {
    id: tutor.id,
    name: tutor.name,
    description: tutor.description || '',
    type: tutor.type as any,
    status: tutor.status as any,
    createdAt: tutor.created_at,
    updatedAt: tutor.updated_at,
    model: tutor.model,
    voice: tutor.voice,
    voiceProvider: tutor.voice_provider,
    customVoiceId: tutor.custom_voice_id,
    voiceTraits: Array.isArray(tutor.voice_traits) ? tutor.voice_traits as VoiceTrait[] : [],
    interactions: tutor.interactions || 0,
    studentsSaved: tutor.students_saved || 0,
    helpfulnessScore: tutor.helpfulness_score || 0,
    avmScore: tutor.avm_score || 0,
    csat: tutor.csat || 0,
    performance: tutor.performance || 0,
    channels: Array.isArray(tutor.channels) ? tutor.channels as string[] : [],
    channelConfigs: typeof tutor.channel_configs === 'object' && tutor.channel_configs ? tutor.channel_configs as Record<string, AgentChannelConfig> : {},
    isPersonal: tutor.is_personal,
    phone: tutor.phone,
    email: tutor.email,
    avatar: tutor.avatar,
    purpose: tutor.purpose,
    prompt: tutor.prompt,
    subject: tutor.subject,
    gradeLevel: tutor.grade_level,
    teachingStyle: tutor.teaching_style,
    customSubject: tutor.custom_subject,
    learningObjective: tutor.learning_objective
  };
};

export const updateAgent = async (id: string, updates: Partial<AgentType>): Promise<AgentType> => {
  console.log("Updating tutor with ID:", id, "Updates:", updates);
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User must be authenticated to update tutor");
  }

  // Transform the updates to match database column names
  const tutorUpdates = {
    ...(updates.name && { name: updates.name }),
    ...(updates.description !== undefined && { description: updates.description }),
    ...(updates.type && { type: updates.type }),
    ...(updates.status && { status: updates.status }),
    ...(updates.model && { model: updates.model }),
    ...(updates.voice && { voice: updates.voice }),
    ...(updates.voiceProvider && { voice_provider: updates.voiceProvider }),
    ...(updates.customVoiceId && { custom_voice_id: updates.customVoiceId }),
    ...(updates.voiceTraits && { voice_traits: updates.voiceTraits }),
    ...(updates.avatar && { avatar: updates.avatar }),
    ...(updates.phone && { phone: updates.phone }),
    ...(updates.email && { email: updates.email }),
    ...(updates.purpose && { purpose: updates.purpose }),
    ...(updates.prompt !== undefined && { prompt: updates.prompt }),
    ...(updates.subject && { subject: updates.subject }),
    ...(updates.gradeLevel && { grade_level: updates.gradeLevel }),
    ...(updates.teachingStyle && { teaching_style: updates.teachingStyle }),
    ...(updates.customSubject && { custom_subject: updates.customSubject }),
    ...(updates.learningObjective !== undefined && { learning_objective: updates.learningObjective }),
    ...(updates.channels && { channels: updates.channels }),
    ...(updates.channelConfigs && { channel_configs: updates.channelConfigs }),
    ...(updates.isPersonal !== undefined && { is_personal: updates.isPersonal })
  };

  const { data: tutor, error } = await supabase
    .from('tutors')
    .update(tutorUpdates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    console.error("Error updating tutor:", error);
    throw new Error(`Failed to update tutor: ${error.message}`);
  }

  if (!tutor) {
    throw new Error("Tutor not found or access denied");
  }

  console.log("Updated tutor:", tutor);

  // Transform the data back to AgentType interface with proper type handling
  return {
    id: tutor.id,
    name: tutor.name,
    description: tutor.description || '',
    type: tutor.type as any,
    status: tutor.status as any,
    createdAt: tutor.created_at,
    updatedAt: tutor.updated_at,
    model: tutor.model,
    voice: tutor.voice,
    voiceProvider: tutor.voice_provider,
    customVoiceId: tutor.custom_voice_id,
    voiceTraits: Array.isArray(tutor.voice_traits) ? tutor.voice_traits as VoiceTrait[] : [],
    interactions: tutor.interactions || 0,
    studentsSaved: tutor.students_saved || 0,
    helpfulnessScore: tutor.helpfulness_score || 0,
    avmScore: tutor.avm_score || 0,
    csat: tutor.csat || 0,
    performance: tutor.performance || 0,
    channels: Array.isArray(tutor.channels) ? tutor.channels as string[] : [],
    channelConfigs: typeof tutor.channel_configs === 'object' && tutor.channel_configs ? tutor.channel_configs as Record<string, AgentChannelConfig> : {},
    isPersonal: tutor.is_personal,
    phone: tutor.phone,
    email: tutor.email,
    avatar: tutor.avatar,
    purpose: tutor.purpose,
    prompt: tutor.prompt,
    subject: tutor.subject,
    gradeLevel: tutor.grade_level,
    teachingStyle: tutor.teaching_style,
    customSubject: tutor.custom_subject,
    learningObjective: tutor.learning_objective
  };
};

export const createAgent = async (agentData: Partial<AgentType>): Promise<AgentType> => {
  console.log("Creating tutor with data:", agentData);
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User must be authenticated to create a tutor");
  }

  const tutorData = {
    name: agentData.name || '',
    description: agentData.description || '',
    type: agentData.type || 'General Tutor',
    status: agentData.status || 'draft',
    model: agentData.model || 'GPT-4',
    voice: agentData.voice,
    voice_provider: agentData.voiceProvider,
    custom_voice_id: agentData.customVoiceId,
    voice_traits: agentData.voiceTraits || [],
    interactions: agentData.interactions || 0,
    students_saved: agentData.studentsSaved || 0,
    helpfulness_score: agentData.helpfulnessScore || 0,
    avm_score: agentData.avmScore || 0,
    csat: agentData.csat || 0,
    performance: agentData.performance || 0,
    channels: agentData.channels || [],
    channel_configs: agentData.channelConfigs || {},
    is_personal: agentData.isPersonal ?? true,
    phone: agentData.phone,
    email: agentData.email,
    avatar: agentData.avatar,
    purpose: agentData.purpose,
    prompt: agentData.prompt,
    subject: agentData.subject,
    grade_level: agentData.gradeLevel,
    teaching_style: agentData.teachingStyle,
    custom_subject: agentData.customSubject,
    learning_objective: agentData.learningObjective,
    user_id: user.id
  };

  const { data: tutor, error } = await supabase
    .from('tutors')
    .insert(tutorData)
    .select()
    .single();

  if (error) {
    console.error("Error creating tutor:", error);
    throw new Error(`Failed to create tutor: ${error.message}`);
  }

  console.log("Created tutor:", tutor);

  // Transform the data to match AgentType interface with proper type handling
  return {
    id: tutor.id,
    name: tutor.name,
    description: tutor.description || '',
    type: tutor.type as any,
    status: tutor.status as any,
    createdAt: tutor.created_at,
    updatedAt: tutor.updated_at,
    model: tutor.model,
    voice: tutor.voice,
    voiceProvider: tutor.voice_provider,
    customVoiceId: tutor.custom_voice_id,
    voiceTraits: Array.isArray(tutor.voice_traits) ? tutor.voice_traits as VoiceTrait[] : [],
    interactions: tutor.interactions || 0,
    studentsSaved: tutor.students_saved || 0,
    helpfulnessScore: tutor.helpfulness_score || 0,
    avmScore: tutor.avm_score || 0,
    csat: tutor.csat || 0,
    performance: tutor.performance || 0,
    channels: Array.isArray(tutor.channels) ? tutor.channels as string[] : [],
    channelConfigs: typeof tutor.channel_configs === 'object' && tutor.channel_configs ? tutor.channel_configs as Record<string, AgentChannelConfig> : {},
    isPersonal: tutor.is_personal,
    phone: tutor.phone,
    email: tutor.email,
    avatar: tutor.avatar,
    purpose: tutor.purpose,
    prompt: tutor.prompt,
    subject: tutor.subject,
    gradeLevel: tutor.grade_level,
    teachingStyle: tutor.teaching_style,
    customSubject: tutor.custom_subject,
    learningObjective: tutor.learning_objective
  };
};
