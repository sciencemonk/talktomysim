
import { useState, useEffect } from 'react';
import { fetchUserAdvisors, addUserAdvisor, removeUserAdvisor, UserAdvisor } from '@/services/userAdvisorService';
import { AgentType } from '@/types/agent';
import { useAuth } from '@/hooks/useAuth';

export const useUserAdvisors = () => {
  const { user } = useAuth();
  const [userAdvisors, setUserAdvisors] = useState<UserAdvisor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!user) {
      setUserAdvisors([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const data = await fetchUserAdvisors();
      setUserAdvisors(data);
      setError(null);
    } catch (err: any) {
      console.error("Error loading user advisors:", err);
      setError(err.message || "Failed to load user advisors");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const addAdvisor = async (advisor: AgentType) => {
    try {
      const newUserAdvisor = await addUserAdvisor(advisor);
      setUserAdvisors(prev => [newUserAdvisor, ...prev]);
      return newUserAdvisor;
    } catch (err: any) {
      setError(err.message || "Failed to add advisor");
      throw err;
    }
  };

  const removeAdvisor = async (advisorId: string) => {
    try {
      await removeUserAdvisor(advisorId);
      setUserAdvisors(prev => prev.filter(a => a.advisor_id !== advisorId));
    } catch (err: any) {
      setError(err.message || "Failed to remove advisor");
      throw err;
    }
  };

  // Convert UserAdvisor to AgentType format for compatibility
  const getAdvisorsAsAgents = (): AgentType[] => {
    return userAdvisors.map(advisor => ({
      id: advisor.advisor_id,
      name: advisor.name,
      description: advisor.description || '',
      auto_description: advisor.auto_description,
      type: 'General Tutor' as any,
      status: 'active' as any,
      createdAt: advisor.created_at,
      updatedAt: advisor.updated_at,
      avatar: advisor.avatar_url,
      prompt: advisor.prompt,
      subject: advisor.category || 'General',
      title: advisor.title,
      is_featured: false,
      model: 'GPT-4',
      interactions: 0,
      studentsSaved: 0,
      helpfulnessScore: 0,
      avmScore: 0,
      csat: 0,
      performance: 0,
      channels: [],
      channelConfigs: {},
      isPersonal: false,
      voiceTraits: []
    }));
  };

  return { 
    userAdvisors, 
    advisorsAsAgents: getAdvisorsAsAgents(),
    isLoading, 
    error, 
    addAdvisor, 
    removeAdvisor, 
    refetch: fetchData 
  };
};
