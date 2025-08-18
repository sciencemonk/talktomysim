
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, MicOff, Volume2, VolumeX, MessageSquare, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { AgentType } from '@/types/agent';
import { supabase } from '@/integrations/supabase/client';

interface EfficientVoiceInterfaceProps {
  agent: AgentType;
  onTranscriptUpdate: (transcript: string, isFromUser: boolean) => void;
  onSpeakingChange: (speaking: boolean) => void;
}

const EfficientVoiceInterface: React.FC<EfficientVoiceInterfaceProps> = ({ 
  agent, 
  onTranscriptUpdate, 
  onSpeakingChange 
}) => {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true); // Default to enabled
  const [error, setError] = useState<string | null>(null);
  const [hasGivenIntro, setHasGivenIntro] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Give introduction when component mounts
  useEffect(() => {
    if (!hasGivenIntro && voiceEnabled) {
      giveIntroduction();
      setHasGivenIntro(true);
    }
  }, [hasGivenIntro, voiceEnabled, agent]);

  const giveIntroduction = async () => {
    const introText = `Hello! I'm ${agent.name}, your ${agent.type.toLowerCase()}${agent.subject ? ` for ${agent.subject}` : ''}. ${agent.description} I'm here to help you learn about ${agent.learningObjective || 'this topic'}. What would you like to explore first?`;
    
    onTranscriptUpdate(introText, false);
    
    if (voiceEnabled) {
      await generateSpeech(introText);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000, // Lower sample rate to reduce data
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setError(null);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      setError('Microphone access denied');
      toast({
        title: "Error",
        description: "Could not access microphone",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    
    try {
      // Convert audio to text using Whisper API (much cheaper than Realtime)
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.webm');
      
      const transcriptionResponse = await supabase.functions.invoke('speech-to-text', {
        body: formData
      });
      
      if (transcriptionResponse.error) {
        throw new Error(transcriptionResponse.error.message);
      }
      
      const userText = transcriptionResponse.data.text;
      onTranscriptUpdate(userText, true);
      
      // Get AI response using cheaper chat completion API
      const chatResponse = await supabase.functions.invoke('chat-completion', {
        body: {
          messages: [{ role: 'user', content: userText }],
          agent: agent
        }
      });
      
      if (chatResponse.error) {
        throw new Error(chatResponse.error.message);
      }
      
      const aiText = chatResponse.data.content;
      onTranscriptUpdate(aiText, false);
      
      // Always generate speech since this is a voice-first experience
      if (voiceEnabled) {
        await generateSpeech(aiText);
      }
      
    } catch (error) {
      console.error('Error processing audio:', error);
      setError(error instanceof Error ? error.message : 'Processing failed');
      toast({
        title: "Error",
        description: "Failed to process audio",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const generateSpeech = async (text: string) => {
    try {
      onSpeakingChange(true);
      
      const response = await supabase.functions.invoke('text-to-speech', {
        body: { text, voice: 'alloy' }
      });
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      // Play the audio
      if (!audioElementRef.current) {
        audioElementRef.current = document.createElement("audio");
        audioElementRef.current.onended = () => onSpeakingChange(false);
      }
      
      const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      audioElementRef.current.src = audioUrl;
      audioElementRef.current.play();
      
    } catch (error) {
      console.error('Error generating speech:', error);
      onSpeakingChange(false);
    }
  };

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
    toast({
      title: voiceEnabled ? "Voice Disabled" : "Voice Enabled",
      description: voiceEnabled ? "AI will respond with text only" : "AI will speak responses",
    });
  };

  useEffect(() => {
    return () => {
      mediaRecorderRef.current?.stop();
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current.src = '';
      }
    };
  }, []);

  return (
    <Card className="fixed bottom-8 left-1/2 -translate-x-1/2 w-auto">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : isProcessing ? 'bg-yellow-500 animate-pulse' : 'bg-gray-400'}`} />
            <span className="text-sm font-medium">
              {isRecording ? 'Recording...' : isProcessing ? 'Processing...' : 'Ready'}
            </span>
          </div>
          
          <Button
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            disabled={isProcessing}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isRecording ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
            <span className="ml-2">
              {isRecording ? 'Release to Send' : 'Hold to Talk'}
            </span>
          </Button>
          
          <Button
            onClick={toggleVoice}
            variant="outline"
            size="sm"
            title={voiceEnabled ? "Disable voice responses" : "Enable voice responses"}
          >
            {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
          
          {error && (
            <div className="flex items-center gap-2 text-destructive">
              <MessageSquare className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EfficientVoiceInterface;
