import React, { useEffect, useRef, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Mic, MicOff, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { Button } from './ui/button';

interface OpenAIVoiceInterfaceProps {
  systemInstruction: string;
  onTranscript?: (text: string, isUser: boolean) => void;
  onConnectionChange?: (connected: boolean) => void;
  autoStart?: boolean;
}

class AudioQueue {
  private queue: Uint8Array[] = [];
  private isPlaying = false;
  private audioContext: AudioContext;

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
  }

  async addToQueue(audioData: Uint8Array) {
    this.queue.push(audioData);
    if (!this.isPlaying) {
      await this.playNext();
    }
  }

  private createWavFromPCM(pcmData: Uint8Array): Uint8Array {
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
  }

  private async playNext() {
    if (this.queue.length === 0) {
      this.isPlaying = false;
      return;
    }

    this.isPlaying = true;
    const audioData = this.queue.shift()!;

    try {
      const wavData = this.createWavFromPCM(audioData);
      const arrayBuffer = new ArrayBuffer(wavData.byteLength);
      const view = new Uint8Array(arrayBuffer);
      view.set(wavData);
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);
      
      source.onended = () => this.playNext();
      source.start(0);
    } catch (error) {
      console.error('Error playing audio:', error);
      this.playNext();
    }
  }
}

const OpenAIVoiceInterface: React.FC<OpenAIVoiceInterfaceProps> = ({
  systemInstruction,
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
  const audioQueueRef = useRef<AudioQueue | null>(null);

  const connectToOpenAI = async () => {
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
      
      mediaStreamRef.current = stream;
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      audioQueueRef.current = new AudioQueue(audioContextRef.current);
      
      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      audioProcessorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);

      const ws = new WebSocket('wss://uovhemqkztmkoozlmqxq.supabase.co/functions/v1/openai-realtime');
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Connected to OpenAI relay');
        ws.send(JSON.stringify({
          type: 'init',
          systemInstruction: systemInstruction
        }));
      };

      ws.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received:', data.type);
          
          if (data.type === 'ready') {
            setIsConnected(true);
            onConnectionChange?.(true);
            startAudioCapture();
            
            toast({
              title: "Voice connected",
              description: "AI agent is ready",
            });
          } else if (data.type === 'response.audio.delta') {
            setIsSpeaking(true);
            const binaryString = atob(data.delta);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            await audioQueueRef.current?.addToQueue(bytes);
          } else if (data.type === 'response.audio.done') {
            setIsSpeaking(false);
          } else if (data.type === 'response.audio_transcript.delta') {
            onTranscript?.(data.delta, false);
          } else if (data.type === 'conversation.item.input_audio_transcription.completed') {
            onTranscript?.(data.transcript, true);
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

      ws.onclose = () => handleDisconnect();

    } catch (error) {
      console.error('Error connecting:', error);
      toast({
        title: "Microphone error",
        description: "Please allow microphone access",
        variant: "destructive"
      });
    }
  };

  const startAudioCapture = () => {
    if (!audioProcessorRef.current || !sourceRef.current || !wsRef.current) return;

    audioProcessorRef.current.onaudioprocess = (e) => {
      if (isMuted || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

      const inputData = e.inputBuffer.getChannelData(0);
      const pcm16 = new Int16Array(inputData.length);
      for (let i = 0; i < inputData.length; i++) {
        const s = Math.max(-1, Math.min(1, inputData[i]));
        pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      }

      const uint8Array = new Uint8Array(pcm16.buffer);
      const base64Audio = btoa(String.fromCharCode(...Array.from(uint8Array)));

      wsRef.current.send(JSON.stringify({
        type: 'input_audio_buffer.append',
        audio: base64Audio
      }));
    };

    sourceRef.current.connect(audioProcessorRef.current);
    audioProcessorRef.current.connect(audioContextRef.current!.destination);
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

  const toggleMute = () => setIsMuted(!isMuted);

  useEffect(() => {
    if (autoStart) {
      connectToOpenAI();
    }
    return () => handleDisconnect();
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

export default OpenAIVoiceInterface;
