
import { useState, useEffect, useCallback } from 'react';
import { simService, SimData, SimCompletionStatus } from '@/services/simService';
import { useAuth } from '@/hooks/useAuth';


export const useSim = () => {
  const { user } = useAuth();
  const [sim, setSim] = useState<SimData | null>(null);
  const [completionStatus, setCompletionStatus] = useState<SimCompletionStatus>({
    basic_info: false,
    interaction_model: false,
    core_knowledge: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSim = useCallback(async () => {
    if (!user) {
      setSim(null);
      setIsLoading(false);
      console.log('useSim: No user found, skipping sim load');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log('useSim: Loading sim for user:', user.id);
      
      const simData = await simService.getUserSim();
      console.log('useSim: Sim loaded:', simData ? `ID: ${simData.id}, Name: ${simData.name}` : 'No sim found');
      setSim(simData);
      
      const status = await simService.getCompletionStatus();
      setCompletionStatus(status);
    } catch (err: any) {
      console.error('Error loading sim:', err);
      setError(err.message || 'Failed to load sim');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadSim();
  }, [loadSim]);

  const updateBasicInfo = async (basicInfo: Partial<SimData>) => {
    try {
      setError(null);
      const updatedSim = await simService.updateBasicInfo(basicInfo);
      setSim(updatedSim);
      setCompletionStatus(prev => ({ ...prev, basic_info: true }));

      return updatedSim;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to save basic info';
      setError(errorMessage);

      throw err;
    }
  };

  const updateInteractionModel = async (interactionData: {
    welcome_message?: string;
    sample_scenarios?: Array<{
      id: string;
      question: string;
      expectedResponse: string;
    }>;
  }) => {
    try {
      setError(null);
      const updatedSim = await simService.updateInteractionModel(interactionData);
      setSim(updatedSim);
      setCompletionStatus(prev => ({ ...prev, interaction_model: true }));

      return updatedSim;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to save interaction model';
      setError(errorMessage);

      throw err;
    }
  };

  const updateCoreKnowledgeStatus = async () => {
    try {
      setError(null);
      const updatedSim = await simService.updateCoreKnowledgeStatus();
      setSim(updatedSim);
      setCompletionStatus(prev => ({ ...prev, core_knowledge: true }));
      return updatedSim;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update core knowledge status';
      setError(errorMessage);

      throw err;
    }
  };

  const makeSimPublic = async (isPublic: boolean) => {
    try {
      setError(null);
      const updatedSim = await simService.makeSimPublic(isPublic);
      setSim(updatedSim);

      return updatedSim;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update sim visibility';
      setError(errorMessage);

      throw err;
    }
  };

  const toggleSimActive = async (isActive: boolean) => {
    try {
      setError(null);
      const updatedSim = await simService.toggleSimActive(isActive);
      setSim(updatedSim);

      return updatedSim;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to toggle sim status';
      setError(errorMessage);

      throw err;
    }
  };

  const checkCustomUrlAvailability = async (customUrl: string): Promise<boolean> => {
    try {
      return await simService.checkCustomUrlAvailability(customUrl);
    } catch (err: any) {
      console.error('Error checking URL availability:', err);
      return false;
    }
  };

  const refetch = () => {
    loadSim();
  };

  return {
    sim,
    completionStatus,
    isLoading,
    error,
    updateBasicInfo,
    updateInteractionModel,
    updateCoreKnowledgeStatus,
    makeSimPublic,
    toggleSimActive,
    checkCustomUrlAvailability,
    refetch
  };
};
