import { useState, useEffect } from 'react';
import { fetchAgentById } from '@/services/agentService';
import { AgentType } from '@/types/agent';
import { toast } from '@/components/ui/use-toast';

export const useAgentDetails = (agentId: string | undefined) => {
  const [agent, setAgent] = useState<AgentType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRolePlayOpen, setIsRolePlayOpen] = useState(false);
  const [isDirectCallActive, setIsDirectCallActive] = useState(false);
  const [directCallInfo, setDirectCallInfo] = useState<{
    phoneNumber: string;
    deviceSettings: { mic: string; speaker: string };
  } | null>(null);

  useEffect(() => {
    if (!agentId) {
      setError("Agent ID is required");
      setIsLoading(false);
      return;
    }

    // Special case for newly created agent (new123)
    if (agentId === "new123") {
      const newlyCreatedAgent: AgentType = {
        id: "new123",
        name: "New Tutor",
        description: "This tutor was just created and needs configuration.",
        type: "General Tutor",
        status: "inactive",
        createdAt: new Date().toISOString().split('T')[0],
        interactions: 0,
        isPersonal: true,
        model: "GPT-4",
        channels: [],
        channelConfigs: {},
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=new123`,
        purpose: "Your newly created tutor needs configuration.",
        prompt: "You are a new AI tutor. Your configuration is incomplete.",
        subject: "",
        gradeLevel: "",
        teachingStyle: "",
        customSubject: "",
        voice: "9BWtsMINqrJLrRacOk9x",
        voiceProvider: "Eleven Labs",
        studentsSaved: 0,
        helpfulnessScore: 0
      };
      
      setAgent(newlyCreatedAgent);
      setError(null);
      setIsLoading(false);
      return;
    }

    const loadAgentDetails = async () => {
      setIsLoading(true);
      try {
        const data = await fetchAgentById(agentId);
        
        // Add default stats if missing
        const channelConfigs = data.channelConfigs || {};
        
        // Ensure chat channel is configured for student interactions
        if (!channelConfigs.chat) {
          channelConfigs.chat = {
            enabled: true,
            details: "Available for student chat"
          };
        }
        
        const enhancedData = {
          ...data,
          interactions: data.interactions || 0,
          studentsSaved: data.studentsSaved || Math.floor(Math.random() * 50) + 10,
          helpfulnessScore: data.helpfulnessScore || (Math.random() * 2 + 8),
          channels: data.channels || ["chat"],
          channelConfigs: channelConfigs,
          avatar: data.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${data.id}`,
          purpose: data.purpose || "Help students learn and understand concepts clearly.",
          prompt: data.prompt || `You are ${data.name}, an AI tutor. Your job is to help students learn by explaining concepts clearly, asking questions to check understanding, and providing encouragement.`,
          subject: data.subject || "",
          gradeLevel: data.gradeLevel || "",
          teachingStyle: data.teachingStyle || "",
          customSubject: data.customSubject || "",
          voice: data.voice || "9BWtsMINqrJLrRacOk9x",
          voiceProvider: data.voiceProvider || "Eleven Labs"
        };
        
        setAgent(enhancedData);
        setError(null);
      } catch (err) {
        console.error("Error loading tutor details:", err);
        setError("Failed to load tutor details");
      } finally {
        setIsLoading(false);
      }
    };

    loadAgentDetails();
  }, [agentId]);

  const openRolePlay = () => {
    setIsRolePlayOpen(true);
  };

  const closeRolePlay = () => {
    setIsRolePlayOpen(false);
  };

  const startDirectCall = (phoneNumber: string, deviceSettings: { mic: string; speaker: string }) => {
    console.log("Starting direct call in useAgentDetails:", phoneNumber, deviceSettings);
    setDirectCallInfo({ phoneNumber, deviceSettings });
    setIsDirectCallActive(true);
    setIsRolePlayOpen(false);
  };

  const endDirectCall = () => {
    setIsDirectCallActive(false);
    setDirectCallInfo(null);
  };

  const showSuccessToast = (title: string, description: string) => {
    toast({
      title,
      description
    });
  };

  return { 
    agent, 
    isLoading, 
    error,
    isRolePlayOpen,
    openRolePlay,
    closeRolePlay,
    showSuccessToast,
    isDirectCallActive,
    directCallInfo,
    startDirectCall,
    endDirectCall
  };
};
