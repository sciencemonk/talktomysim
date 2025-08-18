
import React from 'react';
import LiveKitVoiceInterface from './LiveKitVoiceInterface';
import { AgentType } from '@/types/agent';

interface VoiceInterfaceProps {
  agent: AgentType;
  onTranscriptUpdate: (transcript: string, isFromUser: boolean) => void;
  onSpeakingChange: (speaking: boolean) => void;
}

const VoiceInterface: React.FC<VoiceInterfaceProps> = (props) => {
  return <LiveKitVoiceInterface {...props} />;
};

export default VoiceInterface;
