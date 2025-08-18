
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, MicOff, Volume2, VolumeX, AlertCircle } from 'lucide-react';
import { AudioRecorder, encodeAudioForAPI, AudioQueue } from '@/utils/RealtimeAudio';
import { AgentType } from '@/types/agent';
import { useToast } from '@/components/ui/use-toast';

interface VoiceInterfaceProps {
  agent: AgentType;
  onTranscriptUpdate: (transcript: string, isFromUser: boolean) => void;
  onSpeakingChange: (speaking: boolean) => void;
}

const VoiceInterface: React.FC<VoiceInterfaceProps> = ({ 
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
  const recorderRef = useRef<AudioRecorder | null>(null);
  const audioQueueRef = useRef<AudioQueue | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentTranscriptRef = useRef('');

  const initializeAudio = async () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext({ sampleRate: 24000 });
        audioQueueRef.current = new AudioQueue(audioContextRef.current);
      }
      // Resume audio context if suspended
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
    } catch (error) {
      console.error('Error initializing audio:', error);
      throw error;
    }
  };

  const connectToRealtime = async () => {
    try {
      setError(null);
      await initializeAudio();
      setConnectionStatus('connecting');

      const ws = new WebSocket(`wss://lcdrsupwwitlvrvfrgsl.supabase.co/functions/v1/realtime-chat`);
      wsRef.current = ws;

      const connectionTimeout = setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          ws.close();
          setError('Connection timeout');
          setConnectionStatus('error');
        }
      }, 10000); // 10 second timeout

      ws.onopen = () => {
        console.log('WebSocket connected');
        clearTimeout(connectionTimeout);
        setIsConnected(true);
        setConnectionStatus('connected');
        toast({
          title: "Connected",
          description: "Voice chat is ready",
        });
      };

      ws.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received:', data.type);

          switch (data.type) {
            case 'session.created':
              console.log('Session created');
              break;

            case 'session.updated':
              console.log('Session updated');
              startRecording();
              break;

            case 'response.audio.delta':
              if (audioQueueRef.current && !isMuted) {
                const binaryString = atob(data.delta);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                  bytes[i] = binaryString.charCodeAt(i);
                }
                await audioQueueRef.current.addToQueue(bytes);
              }
              break;

            case 'response.audio_transcript.delta':
              if (data.delta) {
                currentTranscriptRef.current += data.delta;
                onTranscriptUpdate(currentTranscriptRef.current, false);
              }
              break;

            case 'response.audio_transcript.done':
              onTranscriptUpdate(currentTranscriptRef.current, false);
              currentTranscriptRef.current = '';
              break;

            case 'response.created':
              onSpeakingChange(true);
              break;

            case 'response.done':
              onSpeakingChange(false);
              break;

            case 'input_audio_buffer.speech_started':
              console.log('User started speaking');
              break;

            case 'input_audio_buffer.speech_stopped':
              console.log('User stopped speaking');
              break;

            case 'error':
              console.error('WebSocket error:', data.message);
              setError(data.message);
              toast({
                title: "Error",
                description: data.message,
                variant: "destructive",
              });
              break;
          }
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        clearTimeout(connectionTimeout);
        setError('Connection failed');
        setConnectionStatus('error');
        toast({
          title: "Connection Error",
          description: "Failed to connect to voice chat",
          variant: "destructive",
        });
      };

      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        clearTimeout(connectionTimeout);
        setIsConnected(false);
        setIsRecording(false);
        setConnectionStatus('disconnected');
        stopRecording();
        
        if (event.code !== 1000 && event.code !== 1001) {
          setError(`Connection closed unexpectedly (${event.code})`);
          toast({
            title: "Connection Lost",
            description: "Voice chat disconnected",
            variant: "destructive",
          });
        }
      };

    } catch (error) {
      console.error('Error connecting to realtime:', error);
      setError(error instanceof Error ? error.message : 'Connection failed');
      setConnectionStatus('error');
      toast({
        title: "Error",
        description: "Failed to start voice chat",
        variant: "destructive",
      });
    }
  };

  const startRecording = async () => {
    try {
      recorderRef.current = new AudioRecorder((audioData) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          const base64Audio = encodeAudioForAPI(audioData);
          wsRef.current.send(JSON.stringify({
            type: 'input_audio_buffer.append',
            audio: base64Audio
          }));
        }
      });

      await recorderRef.current.start();
      setIsRecording(true);
      console.log('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      setError('Microphone access denied');
      toast({
        title: "Microphone Error",
        description: "Please allow microphone access to use voice chat",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (recorderRef.current) {
      recorderRef.current.stop();
      recorderRef.current = null;
      setIsRecording(false);
    }
  };

  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnected');
    }
    stopRecording();
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
      audioQueueRef.current = null;
    }
    setError(null);
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

export default VoiceInterface;
