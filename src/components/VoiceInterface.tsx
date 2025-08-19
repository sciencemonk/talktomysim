
import React from 'react';
import LiveKitVoiceInterface from './LiveKitVoiceInterface';
import { AgentType } from '@/types/agent';

interface VoiceInterfaceProps {
  agent: AgentType;
  onUserMessage: (message: string) => void;
  onAiMessageStart: () => void;
  onAiTextDelta: (delta: string) => void;
  onAiMessageComplete: () => void;
  onSpeakingChange: (speaking: boolean) => void;
  onConnectionChange?: (connected: boolean) => void;
  onConnectionStatusChange?: (status: string) => void;
  autoStart?: boolean;
}

const VoiceInterface: React.FC<VoiceInterfaceProps> = (props) => {
  return <LiveKitVoiceInterface {...props} />;
};

export default VoiceInterface;
