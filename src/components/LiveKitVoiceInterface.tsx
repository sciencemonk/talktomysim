
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, MicOff, Volume2, VolumeX, AlertCircle } from 'lucide-react';
import { Room, RoomEvent, Track } from 'livekit-client';
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
  
  const roomRef = useRef<Room | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  const connectToLiveKit = async () => {
    try {
      setError(null);
      setConnectionStatus('connecting');

      // Get LiveKit token from our edge function
      const tokenResponse = await fetch('/api/livekit-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomName: `agent-${agent.id}`,
          participantName: 'user',
          agentPrompt: agent.prompt
        })
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to get LiveKit token');
      }

      const { token, wsUrl } = await tokenResponse.json();

      // Create and connect to LiveKit room
      const room = new Room();
      roomRef.current = room;

      // Set up event handlers
      room.on(RoomEvent.Connected, () => {
        console.log('Connected to LiveKit room');
        setIsConnected(true);
        setConnectionStatus('connected');
        setIsRecording(true);
        toast({
          title: "Connected",
          description: "Voice chat is ready",
        });
      });

      room.on(RoomEvent.Disconnected, () => {
        console.log('Disconnected from LiveKit room');
        setIsConnected(false);
        setIsRecording(false);
        setConnectionStatus('disconnected');
      });

      room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
        if (track.kind === Track.Kind.Audio && participant.isAgent) {
          console.log('Agent audio track subscribed');
          onSpeakingChange(true);
          
          if (audioElementRef.current && !isMuted) {
            track.attach(audioElementRef.current);
          }
        }
      });

      room.on(RoomEvent.TrackUnsubscribed, (track, publication, participant) => {
        if (track.kind === Track.Kind.Audio && participant.isAgent) {
          console.log('Agent audio track unsubscribed');
          onSpeakingChange(false);
          track.detach();
        }
      });

      // Handle transcription events (if available)
      room.on(RoomEvent.DataReceived, (payload, participant) => {
        try {
          const data = JSON.parse(new TextDecoder().decode(payload));
          if (data.type === 'transcript') {
            onTranscriptUpdate(data.text, data.isFromUser);
          }
        } catch (error) {
          console.error('Error parsing data message:', error);
        }
      });

      // Connect to the room
      await room.connect(wsUrl, token);

      // Enable microphone
      await room.localParticipant.enableCameraAndMicrophone(false, true);

    } catch (error) {
      console.error('Error connecting to LiveKit:', error);
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
    if (roomRef.current) {
      roomRef.current.disconnect();
    }
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
    <>
      <audio ref={audioElementRef} autoPlay playsInline />
      <Card className="fixed bottom-8 left-1/2 -translate-x-1/2 w-auto">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {!isConnected ? (
              <div className="flex items-center gap-3">
                <Button 
                  onClick={connectToLiveKit}
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
    </>
  );
};

export default LiveKitVoiceInterface;
