
import { useState, useCallback } from 'react';

export const useVoiceChat = (agentId: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const startVoiceChat = useCallback(() => {
    setIsConnected(true);
    setIsRecording(true);
    console.log('Starting voice chat for agent:', agentId);
  }, [agentId]);

  const stopVoiceChat = useCallback(() => {
    setIsConnected(false);
    setIsRecording(false);
    console.log('Stopping voice chat for agent:', agentId);
  }, [agentId]);

  const toggleMute = useCallback(() => {
    setIsRecording(prev => !prev);
    console.log('Toggling mute for agent:', agentId);
  }, [agentId]);

  return {
    isConnected,
    isRecording,
    startVoiceChat,
    stopVoiceChat,
    toggleMute
  };
};
