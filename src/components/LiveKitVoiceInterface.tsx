import React, { useEffect, useRef, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { AgentType } from '@/types/agent';
import { supabase } from '@/integrations/supabase/client';

interface LiveKitVoiceInterfaceProps {
  agent: AgentType;
  onTranscriptUpdate: (transcript: string, isFromUser: boolean) => void;
  onSpeakingChange: (speaking: boolean) => void;
  onConnectionChange?: (connected: boolean) => void;
  onConnectionStatusChange?: (status: string) => void;
  autoStart?: boolean;
}

const LiveKitVoiceInterface: React.FC<LiveKitVoiceInterfaceProps> = ({ 
  agent, 
  onTranscriptUpdate, 
  onSpeakingChange,
  onConnectionChange,
  onConnectionStatusChange,
  autoStart = false
}) => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  const createSystemInstructions = () => {
    const getAgeAppropriateLanguage = () => {
      const gradeLevel = agent.gradeLevel?.toLowerCase() || '';
      
      if (gradeLevel.includes('k-2') || gradeLevel.includes('kindergarten')) {
        return {
          greeting: "Hi there! I'm so excited to chat with you today!",
          style: "Use simple words, be super enthusiastic, ask lots of what if questions, and relate everything to things kids love like animals, games, or stories",
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

🎯 CRITICAL: You MUST stay focused on the learning objective at ALL times. This is your primary responsibility.

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

🚨 STAYING ON TOPIC - MANDATORY RULES:
- **NEVER discuss topics unrelated to the learning objective: ${learningObjective}**
- **If the student asks about something off-topic, ALWAYS redirect them back**
- **Use phrases like: "That's interesting, but let's focus on ${learningObjective}. How does that connect to..."**
- **Or: "I'd love to chat about that, but I'm here to help you with ${learningObjective}. Speaking of which..."**
- **Be friendly but firm in redirecting: "Great question! But let's get back to ${learningObjective}. What do you think about..."**

REDIRECTION STRATEGIES:
- Acknowledge their off-topic question briefly
- Connect it back to the learning objective if possible
- If no connection exists, politely redirect: "That's fascinating, but my specialty is ${learningObjective}. Let me ask you..."
- Always follow redirections with an engaging question about the learning objective

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
- **ALWAYS related to the learning objective: ${learningObjective}**

AVOID:
- Long explanations or lectures
- Giving away answers too quickly
- Talking more than the student
- Being too formal or teacher-like
- Moving on without getting their input
- **Getting sidetracked by off-topic conversations**
- **Answering questions unrelated to the learning objective**

Remember: Your job is to guide discovery through questions about ${learningObjective}, not to dump information or discuss unrelated topics. Make them the star of the conversation while keeping everything focused on the learning goal!

${agent.prompt ? `Additional Teaching Instructions: ${agent.prompt}` : ''}

The student should be talking at least 50% of the time about ${learningObjective}. Keep them engaged, curious, and actively participating in learning about this specific topic!`;
  };

  const sendWelcomeMessage = () => {
    if (!dcRef.current || dcRef.current.readyState !== 'open') {
      console.log('Data channel not ready for welcome message');
      return;
    }

    console.log('Triggering initial welcome response from AI');
    dcRef.current.send(JSON.stringify({ type: 'response.create' }));
  };

  const connectToRealtime = async () => {
    try {
      setConnectionStatus('connecting');
      onConnectionStatusChange?.('connecting');

      console.log('Getting ephemeral token...');
      
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

      pcRef.current = new RTCPeerConnection();

      pcRef.current.ontrack = (e) => {
        console.log('Received remote audio track');
        if (!audioElementRef.current) {
          audioElementRef.current = document.createElement("audio");
          audioElementRef.current.autoplay = true;
        }
        audioElementRef.current.srcObject = e.streams[0];
      };

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

      dcRef.current = pcRef.current.createDataChannel("oai-events");
      
      dcRef.current.addEventListener("message", (e) => {
        try {
          const event = JSON.parse(e.data);
          console.log("Received event:", event.type);
          
          if (event.type === 'response.audio_transcript.delta') {
            onTranscriptUpdate(event.delta, false);
          } else if (event.type === 'input_audio_buffer.speech_started') {
            console.log('User started speaking');
            onSpeakingChange(false); // AI stops speaking when user starts
          } else if (event.type === 'input_audio_buffer.speech_stopped') {
            console.log('User stopped speaking');
          } else if (event.type === 'response.audio.delta') {
            onSpeakingChange(true); // AI is speaking
          } else if (event.type === 'response.audio.done') {
            onSpeakingChange(false); // AI finished speaking
          }
        } catch (error) {
          console.error('Error parsing data channel message:', error);
        }
      });

      dcRef.current.addEventListener("open", () => {
        console.log('Data channel opened');
        
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
        
        setTimeout(() => {
          sendWelcomeMessage();
        }, 1000);
      });

      const offer = await pcRef.current.createOffer();
      await pcRef.current.setLocalDescription(offer);

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
      setConnectionStatus('connected');
      onConnectionChange?.(true);
      onConnectionStatusChange?.('connected');
      
    } catch (error) {
      console.error('Error connecting to Realtime API:', error);
      setConnectionStatus('error');
      onConnectionStatusChange?.('error');
      toast({
        title: "Connection Error",
        description: "Failed to start voice chat. Please try refreshing the page.",
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
    setConnectionStatus('disconnected');
    onConnectionChange?.(false);
    onConnectionStatusChange?.('disconnected');
    onSpeakingChange(false);
  };

  useEffect(() => {
    if (autoStart && !isConnected) {
      const timer = setTimeout(() => {
        connectToRealtime();
      }, 1000); // Small delay to let UI render
      
      return () => clearTimeout(timer);
    }
  }, [autoStart, isConnected]);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  // This component now runs invisibly in the background
  return null;
};

export default LiveKitVoiceInterface;
