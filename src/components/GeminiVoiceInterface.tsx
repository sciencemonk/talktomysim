import React, { useEffect, useRef, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Mic, MicOff, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { Button } from './ui/button';

interface GeminiVoiceInterfaceProps {
  systemInstruction: string;
  greetingMessage?: string;
  onTranscript?: (text: string, isUser: boolean) => void;
  onConnectionChange?: (connected: boolean) => void;
  autoStart?: boolean;
}

const GeminiVoiceInterface: React.FC<GeminiVoiceInterfaceProps> = ({
  systemInstruction,
  greetingMessage,
  onTranscript,
  onConnectionChange,
  autoStart = false
}) => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const wsRef = useRef<WebSocket | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const connectToGemini = async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      mediaStreamRef.current = stream;

      // Setup audio context for capturing audio
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      audioProcessorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);

      // Connect to WebSocket relay
      const ws = new WebSocket('wss://uovhemqkztmkoozlmqxq.supabase.co/functions/v1/gemini-live');
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Connected to Gemini Live');
        
        // Send initialization with system prompt
        ws.send(JSON.stringify({
          type: 'init',
          systemInstruction: systemInstruction
        }));
      };

      ws.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'ready') {
            setIsConnected(true);
            onConnectionChange?.(true);
            
            // Start sending audio after connection is ready
            startAudioCapture();
            
            // Send greeting message automatically if provided
            if (greetingMessage) {
              ws.send(JSON.stringify({
                client_content: {
                  turns: [{
                    role: 'user',
                    parts: [{ text: greetingMessage }]
                  }],
                  turn_complete: true
                }
              }));
            }
            
            toast({
              title: "Voice connected",
              description: "AI agent is ready to help you",
            });
          } else if (data.serverContent?.modelTurn) {
            // Handle Gemini response
            const turn = data.serverContent.modelTurn;
            
            // Handle text transcript if available
            if (turn.parts) {
              for (const part of turn.parts) {
                if (part.text) {
                  onTranscript?.(part.text, false);
                }
                
                // Handle audio response
                if (part.inlineData?.mimeType === 'audio/pcm' && part.inlineData?.data) {
                  setIsSpeaking(true);
                  await playAudioData(part.inlineData.data);
                  setIsSpeaking(false);
                }
              }
            }
          } else if (data.type === 'error') {
            console.error('Gemini error:', data.message);
            toast({
              title: "Voice error",
              description: data.message,
              variant: "destructive"
            });
          } else if (data.type === 'disconnected') {
            handleDisconnect();
          }
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast({
          title: "Connection error",
          description: "Failed to connect to voice service",
          variant: "destructive"
        });
      };

      ws.onclose = () => {
        handleDisconnect();
      };

    } catch (error) {
      console.error('Error connecting to Gemini:', error);
      toast({
        title: "Microphone error",
        description: "Please allow microphone access to use voice chat",
        variant: "destructive"
      });
    }
  };

  const startAudioCapture = () => {
    if (!audioProcessorRef.current || !sourceRef.current || !wsRef.current) return;

    audioProcessorRef.current.onaudioprocess = (e) => {
      if (isMuted || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

      const inputData = e.inputBuffer.getChannelData(0);
      
      // Convert Float32Array to Int16Array (PCM16)
      const pcm16 = new Int16Array(inputData.length);
      for (let i = 0; i < inputData.length; i++) {
        const s = Math.max(-1, Math.min(1, inputData[i]));
        pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      }

      // Convert to base64
      const uint8Array = new Uint8Array(pcm16.buffer);
      const base64Audio = btoa(String.fromCharCode(...Array.from(uint8Array)));

      // Send audio chunk to Gemini
      wsRef.current.send(JSON.stringify({
        realtime_input: {
          media_chunks: [{
            mime_type: 'audio/pcm',
            data: base64Audio
          }]
        }
      }));
    };

    sourceRef.current.connect(audioProcessorRef.current);
    audioProcessorRef.current.connect(audioContextRef.current.destination);
  };

  const playAudioData = async (base64Audio: string): Promise<void> => {
    try {
      if (!audioContextRef.current) return;

      // Decode base64 to PCM
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Gemini outputs 24kHz, so we need to handle that
      const audioData = new Int16Array(bytes.buffer);
      const audioBuffer = audioContextRef.current.createBuffer(
        1, // mono
        audioData.length,
        24000 // 24kHz output from Gemini
      );

      const channelData = audioBuffer.getChannelData(0);
      for (let i = 0; i < audioData.length; i++) {
        channelData[i] = audioData[i] / 32768.0; // Convert to Float32
      }

      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      
      return new Promise((resolve) => {
        source.onended = () => resolve();
        source.start(0);
      });
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setIsSpeaking(false);
    onConnectionChange?.(false);

    if (audioProcessorRef.current) {
      audioProcessorRef.current.disconnect();
      audioProcessorRef.current = null;
    }

    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  useEffect(() => {
    if (autoStart) {
      connectToGemini();
    }

    return () => {
      handleDisconnect();
    };
  }, []);

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Connecting voice agent...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-4 p-4">
      <div className={`flex items-center gap-2 text-sm ${isSpeaking ? 'text-primary' : 'text-muted-foreground'}`}>
        {isSpeaking ? (
          <>
            <Volume2 className="h-4 w-4 animate-pulse" />
            AI is speaking...
          </>
        ) : (
          <>
            <VolumeX className="h-4 w-4" />
            Listening...
          </>
        )}
      </div>
      
      <Button
        onClick={toggleMute}
        variant={isMuted ? "destructive" : "secondary"}
        size="icon"
      >
        {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
      </Button>

      <Button onClick={handleDisconnect} variant="outline" size="sm">
        End Voice Chat
      </Button>
    </div>
  );
};

export default GeminiVoiceInterface;
