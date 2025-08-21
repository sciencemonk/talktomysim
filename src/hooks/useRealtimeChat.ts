
import { useState, useEffect, useRef, useCallback } from 'react';
import { AgentType } from '@/types/agent';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  role: 'user' | 'system';
  content: string;
  timestamp: Date;
  isComplete: boolean;
}

interface UseRealtimeChatProps {
  agent: AgentType | null;
}

export const useRealtimeChat = ({ agent }: UseRealtimeChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('disconnected');
  const [currentMessage, setCurrentMessage] = useState<string>('');
  
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentMessageIdRef = useRef<string>('');

  const initializeAudioContext = useCallback(async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });
    }
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
  }, []);

  const createWavFromPCM = useCallback((pcmData: Uint8Array) => {
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
  }, []);

  const playAudioData = useCallback(async (audioData: Uint8Array) => {
    if (!audioContextRef.current) return;

    try {
      const wavData = createWavFromPCM(audioData);
      const audioBuffer = await audioContextRef.current.decodeAudioData(wavData.buffer);
      
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      
      source.start(0);
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  }, [createWavFromPCM]);

  const connectWebSocket = useCallback(async () => {
    if (!agent) {
      console.log('No agent available, cannot connect WebSocket');
      return;
    }

    console.log('Connecting to WebSocket...');
    setConnectionStatus('connecting');

    try {
      // Get an ephemeral token from our edge function
      const { data: tokenData, error: tokenError } = await supabase.functions.invoke('realtime-token', {
        body: {}
      });

      if (tokenError || !tokenData) {
        throw new Error(tokenError?.message || 'Failed to get ephemeral token');
      }

      if (!tokenData.client_secret?.value) {
        throw new Error("No ephemeral token received");
      }

      console.log('Got ephemeral token');

      // Connect to OpenAI WebSocket with the ephemeral token
      const ws = new WebSocket(`wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17`, [
        'realtime',
        `openai-insecure-api-key.${tokenData.client_secret.value}`,
      ]);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setConnectionStatus('connected');
        wsRef.current = ws;

        // Send session configuration after connection
        const sessionConfig = {
          type: 'session.update',
          session: {
            modalities: ['text', 'audio'],
            instructions: `You are ${agent.name}, a ${agent.type.toLowerCase()}${agent.subject ? ` specializing in ${agent.subject}` : ''}. ${agent.description || ''}. Be helpful, engaging, and educational.`,
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
      };

      ws.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        console.log('WebSocket message:', data.type, data);

        switch (data.type) {
          case 'session.created':
            console.log('Session created successfully');
            break;

          case 'session.updated':
            console.log('Session updated successfully');
            break;

          case 'response.created':
            console.log('Response created');
            setIsSpeaking(true);
            currentMessageIdRef.current = `msg_${Date.now()}`;
            setCurrentMessage('');
            break;

          case 'response.audio_transcript.delta':
            if (data.delta) {
              setCurrentMessage(prev => prev + data.delta);
            }
            break;

          case 'response.audio_transcript.done':
            if (currentMessageIdRef.current && currentMessage) {
              const newMessage: Message = {
                id: currentMessageIdRef.current,
                role: 'system',
                content: currentMessage,
                timestamp: new Date(),
                isComplete: true
              };
              setMessages(prev => [...prev, newMessage]);
              setCurrentMessage('');
            }
            break;

          case 'response.audio.delta':
            if (data.delta) {
              const binaryString = atob(data.delta);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              await playAudioData(bytes);
            }
            break;

          case 'response.done':
            console.log('Response completed');
            setIsSpeaking(false);
            break;

          case 'input_audio_buffer.speech_started':
            console.log('Speech started');
            break;

          case 'input_audio_buffer.speech_stopped':
            console.log('Speech stopped');
            break;

          case 'error':
            console.error('WebSocket error:', data);
            break;
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('error');
        setIsConnected(false);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        setConnectionStatus('disconnected');
        setIsSpeaking(false);
        wsRef.current = null;
      };

    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      setConnectionStatus('error');
      setIsConnected(false);
    }
  }, [agent, currentMessage, playAudioData]);

  const sendTextMessage = useCallback((text: string) => {
    if (!wsRef.current || !isConnected) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
      isComplete: true
    };

    setMessages(prev => [...prev, userMessage]);

    const event = {
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [{
          type: 'input_text',
          text: text
        }]
      }
    };

    wsRef.current.send(JSON.stringify(event));
    wsRef.current.send(JSON.stringify({ type: 'response.create' }));
  }, [isConnected]);

  useEffect(() => {
    if (agent) {
      initializeAudioContext();
      connectWebSocket();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [agent, connectWebSocket, initializeAudioContext]);

  return {
    messages,
    isConnected,
    isSpeaking,
    connectionStatus,
    sendTextMessage,
    currentMessage
  };
};
