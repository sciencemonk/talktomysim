
import React from 'react';
import EfficientVoiceInterface from './EfficientVoiceInterface';
import { AgentType } from '@/types/agent';

interface VoiceInterfaceProps {
  agent: AgentType;
  onTranscriptUpdate: (transcript: string, isFromUser: boolean) => void;
  onSpeakingChange: (speaking: boolean) => void;
}

const VoiceInterface: React.FC<VoiceInterfaceProps> = (props) => {
  return <EfficientVoiceInterface {...props} />;
};

export default VoiceInterface;
