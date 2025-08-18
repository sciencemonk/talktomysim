
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, MicOff, Volume2, VolumeX, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { AgentType } from '@/types/agent';

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
  
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);

  const connectToRealtime = async () => {
    try {
      setError(null);
      setConnectionStatus('connecting');

      // Connect to our Supabase Edge Function WebSocket
      const wsUrl = `wss://lcdrsupwwitlvrvfrgsl.functions.supabase.co/realtime-chat`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Connected to OpenAI Realtime API');
        setIsConnected(true);
        setConnectionStatus('connected');
        setIsRecording(true);
        
        // Configure the session with agent-specific instructions
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
        
        ws.send(JSON.stringify(sessionConfig));
        
        toast({
          title: "Connected",
          description: "Voice chat is ready",
        });
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received event:', data.type);
          
          if (data.type === 'response.audio.delta') {
            // Play audio chunk
            playAudioChunk(data.delta);
            onSpeakingChange(true);
          } else if (data.type === 'response.audio.done') {
            onSpeakingChange(false);
          } else if (data.type === 'response.audio_transcript.delta') {
            onTranscriptUpdate(data.delta, false);
          } else if (data.type === 'input_audio_buffer.speech_started') {
            console.log('User started speaking');
          } else if (data.type === 'input_audio_buffer.speech_stopped') {
            console.log('User stopped speaking');
          }
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Connection error occurred');
        setConnectionStatus('error');
      };

      ws.onclose = () => {
        console.log('WebSocket connection closed');
        setIsConnected(false);
        setIsRecording(false);
        setConnectionStatus('disconnected');
        onSpeakingChange(false);
      };

      // Start recording audio
      await startAudioRecording();

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

  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Create audio context for processing
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      const source = audioContextRef.current.createMediaStreamSource(stream);
      const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);

      processor.onaudioprocess = (e) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          const inputData = e.inputBuffer.getChannelData(0);
          const audioBase64 = encodeAudioForAPI(inputData);
          
          wsRef.current.send(JSON.stringify({
            type: 'input_audio_buffer.append',
            audio: audioBase64
          }));
        }
      };

      source.connect(processor);
      processor.connect(audioContextRef.current.destination);

    } catch (error) {
      console.error('Error starting audio recording:', error);
      throw error;
    }
  };

  const encodeAudioForAPI = (float32Array: Float32Array): string => {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    
    const uint8Array = new Uint8Array(int16Array.buffer);
    let binary = '';
    const chunkSize = 0x8000;
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    
    return btoa(binary);
  };

  const playAudioChunk = async (audioBase64: string) => {
    try {
      if (!audioContextRef.current) return;

      const binaryString = atob(audioBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Convert PCM to WAV and play
      const wavData = createWavFromPCM(bytes);
      const audioBuffer = await audioContextRef.current.decodeAudioData(wavData.buffer);
      
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.start(0);
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const createWavFromPCM = (pcmData: Uint8Array): Uint8Array => {
    const int16Data = new Int16Array(pcmData.length / 2);
    for (let i = 0; i < pcmData.length; i += 2) {
      int16Data[i / 2] = (pcmData[i + 1] << 8) | pcmData[i];
    }
    
    const wavHeader = new ArrayBuffer(44);
    const view = new DataView(wavHeader);
    
    const writeString = (view: DataView, offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    const sampleRate = 24000;
    const numChannels = 1;
    const bitsPerSample = 16;
    const blockAlign = (numChannels * bitsPerSample) / 8;
    const byteRate = sampleRate * blockAlign;

    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + int16Data.byteLength, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    writeString(view, 36, 'data');
    view.setUint32(40, int16Data.byteLength, true);

    const wavArray = new Uint8Array(wavHeader.byteLength + int16Data.byteLength);
    wavArray.set(new Uint8Array(wavHeader), 0);
    wavArray.set(new Uint8Array(int16Data.buffer), wavHeader.byteLength);
    
    return wavArray;
  };

  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setError(null);
    onSpeakingChange(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
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
