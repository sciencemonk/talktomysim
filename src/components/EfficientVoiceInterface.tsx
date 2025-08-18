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
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasGivenIntro, setHasGivenIntro] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
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
      console.log('Processing audio blob of size:', audioBlob.size);
      
      // Convert audio to text using Whisper API
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.webm');
      
      const transcriptionResponse = await supabase.functions.invoke('speech-to-text', {
        body: formData
      });
      
      if (transcriptionResponse.error) {
        throw new Error(transcriptionResponse.error.message);
      }
      
      const userText = transcriptionResponse.data.text;
      console.log('Transcribed text:', userText);
      onTranscriptUpdate(userText, true);
      
      // Get AI response using chat completion API
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
      console.log('AI response:', aiText);
      onTranscriptUpdate(aiText, false);
      
      // Always generate speech since this is a voice-first experience
      if (voiceEnabled) {
        console.log('Generating speech for AI response');
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
      console.log('Starting speech generation for text:', text.substring(0, 50) + '...');
      setIsSpeaking(true);
      onSpeakingChange(true);
      
      const response = await supabase.functions.invoke('text-to-speech', {
        body: { text, voice: 'alloy' }
      });
      
      if (response.error) {
        console.error('TTS error:', response.error);
        throw new Error(response.error.message);
      }
      
      console.log('Speech generation successful, processing audio data');
      
      // Clean up previous audio element if it exists
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current.currentTime = 0;
        if (audioElementRef.current.src) {
          URL.revokeObjectURL(audioElementRef.current.src);
        }
      }
      
      // Create new audio element
      audioElementRef.current = new Audio();
      
      // Set up event handlers before setting the source
      audioElementRef.current.onended = () => {
        console.log('Audio playback ended');
        setIsSpeaking(false);
        onSpeakingChange(false);
      };
      
      audioElementRef.current.onerror = (e) => {
        console.error('Audio playback error:', e);
        setIsSpeaking(false);
        onSpeakingChange(false);
        toast({
          title: "Playback Error",
          description: "Failed to play audio response",
          variant: "destructive",
        });
      };
      
      audioElementRef.current.oncanplaythrough = () => {
        console.log('Audio can play through, starting playback');
        audioElementRef.current?.play().catch(playError => {
          console.error('Error starting playback:', playError);
          setIsSpeaking(false);
          onSpeakingChange(false);
        });
      };
      
      // The response.data is now an ArrayBuffer containing the binary audio data
      const audioData = response.data;
      console.log('Received audio data type:', typeof audioData);
      console.log('Audio data is ArrayBuffer:', audioData instanceof ArrayBuffer);
      
      // Create blob directly from the binary data
      const audioBlob = new Blob([audioData], { type: 'audio/mpeg' });
      
      console.log('Created audio blob of size:', audioBlob.size);
      
      // Create object URL and set as source
      const audioUrl = URL.createObjectURL(audioBlob);
      audioElementRef.current.src = audioUrl;
      audioElementRef.current.volume = 0.8;
      
      // Load the audio
      audioElementRef.current.load();
      
    } catch (error) {
      console.error('Error generating speech:', error);
      setIsSpeaking(false);
      onSpeakingChange(false);
      toast({
        title: "Speech Error",
        description: "Failed to generate speech",
        variant: "destructive",
      });
    }
  };

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
    
    // Stop current audio if disabling voice
    if (voiceEnabled && audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
      setIsSpeaking(false);
      onSpeakingChange(false);
    }
    
    toast({
      title: voiceEnabled ? "Voice Disabled" : "Voice Enabled",
      description: voiceEnabled ? "AI will respond with text only" : "AI will speak responses",
    });
  };

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        if (audioElementRef.current.src) {
          URL.revokeObjectURL(audioElementRef.current.src);
        }
        audioElementRef.current.src = '';
      }
    };
  }, []);

  return (
    <Card className="fixed bottom-8 left-1/2 -translate-x-1/2 w-auto">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              isRecording ? 'bg-red-500 animate-pulse' : 
              isProcessing ? 'bg-yellow-500 animate-pulse' :
              isSpeaking ? 'bg-blue-500 animate-pulse' :
              'bg-gray-400'
            }`} />
            <span className="text-sm font-medium">
              {isRecording ? 'Recording...' : 
               isProcessing ? 'Processing...' :
               isSpeaking ? 'Speaking...' :
               'Ready'}
            </span>
          </div>
          
          <Button
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            disabled={isProcessing || isSpeaking}
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
