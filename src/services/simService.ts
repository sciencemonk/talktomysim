
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface SimData {
  // Basic Info
  full_name?: string;
  professional_title?: string;
  date_of_birth?: string;
  location?: string;
  education?: string;
  current_profession?: string;
  years_experience?: number;
  areas_of_expertise?: string;
  interests?: string[];
  skills?: string[];
  additional_background?: string;
  custom_url?: string;
  avatar_url?: string;
  
  // Core fields
  name: string;
  title?: string;
  description?: string;
  prompt?: string;
  category?: string;
  
  // Interaction Model
  welcome_message?: string;
  sample_scenarios?: Array<{
    id: string;
    question: string;
    expectedResponse: string;
  }>;
  
  // Completion tracking
  completion_status?: {
    basic_info: boolean;
    interaction_model: boolean;
    core_knowledge: boolean;
  };
  
  // Public settings
  is_public?: boolean;
}

export interface SimCompletionStatus {
  basic_info: boolean;
  interaction_model: boolean;
  core_knowledge: boolean;
}

class SimService {
  async getUserSim(): Promise<SimData | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('advisors')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching user sim:', error);
      throw error;
    }

    return data;
  }

  async createOrUpdateSim(simData: Partial<SimData>): Promise<SimData> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const existingSim = await this.getUserSim();

    if (existingSim) {
      const { data, error } = await supabase
        .from('advisors')
        .update({
          ...simData,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating sim:', error);
        throw error;
      }

      return data;
    } else {
      const { data, error } = await supabase
        .from('advisors')
        .insert({
          ...simData,
          user_id: user.id,
          name: simData.name || simData.full_name || 'My Sim',
          prompt: simData.prompt || 'You are a helpful AI assistant.',
          completion_status: {
            basic_info: false,
            interaction_model: false,
            core_knowledge: false,
            ...simData.completion_status
          }
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating sim:', error);
        throw error;
      }

      return data;
    }
  }

  async updateBasicInfo(basicInfo: Partial<SimData>): Promise<SimData> {
    const updatedData = {
      ...basicInfo,
      completion_status: {
        basic_info: true,
        interaction_model: false,
        core_knowledge: false
      }
    };

    // Update completion status by merging with existing
    const existingSim = await this.getUserSim();
    if (existingSim?.completion_status) {
      updatedData.completion_status = {
        ...existingSim.completion_status,
        basic_info: true
      };
    }

    return this.createOrUpdateSim(updatedData);
  }

  async updateInteractionModel(interactionData: {
    welcome_message?: string;
    sample_scenarios?: Array<{
      id: string;
      question: string;
      expectedResponse: string;
    }>;
  }): Promise<SimData> {
    const existingSim = await this.getUserSim();
    const updatedData = {
      ...interactionData,
      completion_status: {
        basic_info: existingSim?.completion_status?.basic_info || false,
        interaction_model: true,
        core_knowledge: existingSim?.completion_status?.core_knowledge || false
      }
    };

    return this.createOrUpdateSim(updatedData);
  }

  async updateCoreKnowledgeStatus(): Promise<SimData> {
    const existingSim = await this.getUserSim();
    const updatedData = {
      completion_status: {
        basic_info: existingSim?.completion_status?.basic_info || false,
        interaction_model: existingSim?.completion_status?.interaction_model || false,
        core_knowledge: true
      }
    };

    return this.createOrUpdateSim(updatedData);
  }

  async getCompletionStatus(): Promise<SimCompletionStatus> {
    const sim = await this.getUserSim();
    return sim?.completion_status || {
      basic_info: false,
      interaction_model: false,
      core_knowledge: false
    };
  }

  async makeSimPublic(isPublic: boolean): Promise<SimData> {
    return this.createOrUpdateSim({ is_public: isPublic });
  }

  async checkCustomUrlAvailability(customUrl: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('advisors')
      .select('id')
      .eq('custom_url', customUrl)
      .single();

    if (error && error.code === 'PGRST116') {
      return true; // URL is available
    }

    return false; // URL is taken or there was an error
  }
}

export const simService = new SimService();
