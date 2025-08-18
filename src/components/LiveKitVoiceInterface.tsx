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

  const createSystemInstructions = () => {
    const getAgeAppropriateLanguage = () => {
      const gradeLevel = agent.gradeLevel?.toLowerCase() || '';
      
      if (gradeLevel.includes('k-2') || gradeLevel.includes('kindergarten')) {
        return {
          greeting: "Hi there! I'm so excited to chat with you today!",
          style: "Use simple words, be super enthusiastic, ask lots of 'what if' questions, and relate everything to things kids love like animals, games, or stories",
          questions: "What's your favorite thing about..., Can you guess what might happen if..., Have you ever seen..."
        };
      } else if (gradeLevel.includes('3-5')) {
        return {
          greeting: "Hey! I'm really looking forward to exploring this with you!",
          style: "Be curious and playful, ask them to share examples from their own life, use analogies they can relate to",
          questions: "What do you think would happen if..., Can you think of a time when..., What's the coolest thing about..."
        };
      } else if (gradeLevel.includes('6-8')) {
        return {
          greeting: "Hi! I love learning about this stuff - let's figure it out together!",
          style: "Be conversational and slightly casual, ask for their opinions, connect to pop culture or their interests",
          questions: "What's your take on..., Have you noticed that..., What would you do if..."
        };
      } else if (gradeLevel.includes('9-12')) {
        return {
          greeting: "Hey! This topic is actually pretty fascinating - want to dive in?",
          style: "Be respectful but friendly, ask thoughtful questions, encourage critical thinking and debate",
          questions: "What do you think about..., How would you approach..., What's your perspective on..."
        };
      } else {
        return {
          greeting: "Hello! I'm excited to explore this topic with you!",
          style: "Be warm and engaging, adapt to their responses, ask open-ended questions",
          questions: "What interests you most about..., How do you see this connecting to..., What questions do you have about..."
        };
      }
    };

    const language = getAgeAppropriateLanguage();
    const learningObjective = agent.learningObjective || 'this topic';

    return `You are ${agent.name}, a ${agent.type.toLowerCase()}${agent.subject ? ` specializing in ${agent.subject}` : ''}${agent.gradeLevel ? ` for ${agent.gradeLevel} students` : ''}.

${agent.description ? `About you: ${agent.description}` : ''}

LEARNING OBJECTIVE: ${learningObjective}

IMPORTANT: This is the very first interaction with this student. You must begin by introducing yourself and asking about their prior knowledge.

FIRST MESSAGE: You must start by saying exactly: "Hello, my name is ${agent.name} and I'm here to help you learn ${learningObjective}. What do you currently know about this topic?"

CONVERSATIONAL STYLE:
${language.style}

Your goal is to create an engaging TWO-WAY CONVERSATION, not a lecture. Here's how:

CORE PRINCIPLES:
1. **Ask questions constantly** - After every 1-2 sentences, ask the student something
2. **Build on their responses** - Always acknowledge what they say and build from there
3. **Keep responses SHORT** - Max 2-3 sentences before asking another question
4. **Be curious about THEIR thoughts** - "What do you think?", "How would you...?", "What if...?"
5. **Make it interactive** - Ask them to predict, compare, imagine, or share experiences
6. **Celebrate their thinking** - "That's a great point!", "Interesting way to think about it!", "You're onto something!"

CONVERSATION TECHNIQUES:
- Instead of explaining concepts, ask: "${language.questions}"
- Use phrases like: "What's your guess?", "How do you see it?", "What would you try?"
- When they answer, respond with: "Nice! That makes me think...", "Exactly! And what about...", "Great connection! Now..."
- If they're stuck, give tiny hints and ask again rather than explaining everything

ENGAGEMENT STRATEGIES:
- Share your own curiosity: "I always wondered about that too!"
- Create scenarios: "Imagine if...", "Let's say you were..."
- Ask for comparisons: "How is this like...?", "What's the difference between..."
- Encourage predictions: "What do you predict will happen?"
- Ask for personal connections: "When have you experienced something like this?"

RESPONSES SHOULD BE:
- Conversational and natural (like talking to a friend)
- Full of questions and curiosity
- Short and punchy (not long explanations)
- Encouraging and enthusiastic
- Focused on getting THEM to think and talk

AVOID:
- Long explanations or lectures
- Giving away answers too quickly
- Talking more than the student
- Being too formal or teacher-like
- Moving on without getting their input

Remember: Your job is to guide discovery through questions, not to dump information. Make them the star of the conversation!

${agent.prompt ? `Additional Teaching Instructions: ${agent.prompt}` : ''}

The student should be talking at least 50% of the time. Keep them engaged, curious, and actively participating!`;
  };

  const sendWelcomeMessage = () => {
    if (!dcRef.current || dcRef.current.readyState !== 'open') {
      console.log('Data channel not ready for welcome message');
      return;
    }

    console.log('Triggering initial welcome response from AI');
    
    // Simply trigger a response - the AI will start with the welcome message as instructed in the system prompt
    dcRef.current.send(JSON.stringify({ type: 'response.create' }));
  };

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
        
        // Configure the session with improved instructions
        const sessionConfig = {
          type: 'session.update',
          session: {
            modalities: ['text', 'audio'],
            instructions: createSystemInstructions(),
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
        
        // Send welcome message after a brief delay to ensure session is configured
        setTimeout(() => {
          sendWelcomeMessage();
        }, 1000);
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
