
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, MicOff, Volume2, VolumeX, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { AgentType } from '@/types/agent';
import { supabase } from '@/integrations/supabase/client';

interface LiveKitVoiceInterfaceProps {
  agent: AgentType;
  onTranscriptUpdate: (transcript: string, isFromUser: boolean) => void;
  onSpeakingChange: (speaking: boolean) => void;
}

const LiveKitVoiceInterface: React.FC<LiveKitVoiceInterfaceProps> = ({ 
  agent, 
  onTranscriptUpdate, 
  onSpeakingChange 
}) => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [error, setError] = useState<string | null>(null);
  
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  const connectToRealtime = async () => {
    try {
      setError(null);
      setConnectionStatus('connecting');

      console.log('Getting ephemeral token...');
      
      // Get ephemeral token from our Supabase Edge Function
      const { data: tokenData, error: tokenError } = await supabase.functions.invoke('realtime-chat', {
        body: { agent_id: agent.id }
      });

      if (tokenError || !tokenData) {
        throw new Error(tokenError?.message || 'Failed to get ephemeral token');
      }

      if (!tokenData.client_secret?.value) {
        throw new Error("No ephemeral token received");
      }

      const ephemeralKey = tokenData.client_secret.value;
      console.log('Got ephemeral token, creating WebRTC connection...');

      // Create peer connection
      pcRef.current = new RTCPeerConnection();

      // Set up remote audio
      pcRef.current.ontrack = (e) => {
        console.log('Received remote audio track');
        if (!audioElementRef.current) {
          audioElementRef.current = document.createElement("audio");
          audioElementRef.current.autoplay = true;
        }
        audioElementRef.current.srcObject = e.streams[0];
      };

      // Add local audio track
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      pcRef.current.addTrack(stream.getTracks()[0]);

      // Set up data channel for events
      dcRef.current = pcRef.current.createDataChannel("oai-events");
      
      dcRef.current.addEventListener("message", (e) => {
        try {
          const event = JSON.parse(e.data);
          console.log("Received event:", event.type);
          
          if (event.type === 'response.audio_transcript.delta') {
            onTranscriptUpdate(event.delta, false);
          } else if (event.type === 'input_audio_buffer.speech_started') {
            console.log('User started speaking');
          } else if (event.type === 'input_audio_buffer.speech_stopped') {
            console.log('User stopped speaking');
          }
        } catch (error) {
          console.error('Error parsing data channel message:', error);
        }
      });

      dcRef.current.addEventListener("open", () => {
        console.log('Data channel opened');
        
        // Configure the session
        const sessionConfig = {
          type: 'session.update',
          session: {
            modalities: ['text', 'audio'],
            instructions: `You are ${agent.name}, a ${agent.type.toLowerCase()}${agent.subject ? ` specializing in ${agent.subject}` : ''}${agent.gradeLevel ? ` for ${agent.gradeLevel} students` : ''}. ${agent.description || ''}`,
            voice: 'alloy',
            input_audio_format: 'pcm16',
            output_audio_format: 'pcm16',
            input_audio_transcription: {
              model: 'whisper-1'
            },
            turn_detection: {
              type: 'server_vad',
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 1000
            },
            temperature: 0.8,
            max_response_output_tokens: 'inf'
          }
        };
        
        dcRef.current?.send(JSON.stringify(sessionConfig));
      });

      // Create and set local description
      const offer = await pcRef.current.createOffer();
      await pcRef.current.setLocalDescription(offer);

      // Connect to OpenAI's Realtime API using WebRTC
      const baseUrl = "https://api.openai.com/v1/realtime";
      const model = "gpt-4o-realtime-preview-2024-12-17";
      
      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${ephemeralKey}`,
          "Content-Type": "application/sdp"
        },
      });

      if (!sdpResponse.ok) {
        throw new Error(`Failed to connect to OpenAI: ${sdpResponse.status}`);
      }

      const answerSdp = await sdpResponse.text();
      const answer = {
        type: "answer" as RTCSdpType,
        sdp: answerSdp,
      };
      
      await pcRef.current.setRemoteDescription(answer);
      console.log("WebRTC connection established");

      setIsConnected(true);
      setIsRecording(true);
      setConnectionStatus('connected');
      
      toast({
        title: "Connected",
        description: "Voice chat is ready",
      });

    } catch (error) {
      console.error('Error connecting to Realtime API:', error);
      setError(error instanceof Error ? error.message : 'Connection failed');
      setConnectionStatus('error');
      toast({
        title: "Error",
        description: "Failed to start voice chat",
        variant: "destructive",
      });
    }
  };

  const disconnect = () => {
    if (dcRef.current) {
      dcRef.current.close();
    }
    if (pcRef.current) {
      pcRef.current.close();
    }
    if (audioElementRef.current) {
      audioElementRef.current.srcObject = null;
    }
    
    setIsConnected(false);
    setIsRecording(false);
    setConnectionStatus('disconnected');
    setError(null);
    onSpeakingChange(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioElementRef.current) {
      audioElementRef.current.muted = !isMuted;
    }
    toast({
      title: isMuted ? "Unmuted" : "Muted",
      description: isMuted ? "You can now hear responses" : "Audio responses are muted",
    });
  };

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return (
    <Card className="fixed bottom-8 left-1/2 -translate-x-1/2 w-auto">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {!isConnected ? (
            <div className="flex items-center gap-3">
              <Button 
                onClick={connectToRealtime}
                disabled={connectionStatus === 'connecting'}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {connectionStatus === 'connecting' ? 'Connecting...' : 'Start Voice Chat'}
              </Button>
              {error && (
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`} />
                <span className="text-sm font-medium">
                  {isRecording ? 'Listening...' : 'Voice Ready'}
                </span>
              </div>
              
              <Button
                onClick={toggleMute}
                variant="outline"
                size="sm"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              
              <Button 
                onClick={disconnect}
                variant="outline"
                size="sm"
              >
                End Call
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveKitVoiceInterface;
