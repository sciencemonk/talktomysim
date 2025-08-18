import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, Send, ArrowUp, Loader2, AlertCircle, Mic, MessageCircle } from 'lucide-react';
import { fetchAgentById } from '@/services/agentService';
import { AgentType } from '@/types/agent';
import VoiceInterface from '@/components/VoiceInterface';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isVoice?: boolean;
}

const StudentChat = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const [agent, setAgent] = useState<AgentType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isVoiceModeEnabled, setIsVoiceModeEnabled] = useState(true); // Default to voice mode
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadAgent = async () => {
      if (!agentId) {
        setError("Tutor ID is required");
        setIsLoading(false);
        return;
      }

      try {
        const data = await fetchAgentById(agentId);
        setAgent(data);
        
        // Generate personalized welcome message using OpenAI
        await generateWelcomeMessage(data);
        
        setError(null);
      } catch (err: any) {
        console.error("Error loading tutor:", err);
        setError("This tutor is not available or doesn't exist.");
      } finally {
        setIsLoading(false);
      }
    };

    loadAgent();
  }, [agentId]);

  const generateWelcomeMessage = async (agentData: AgentType) => {
    try {
      console.log('Generating welcome message for agent:', agentData.name);
      const welcomePrompt = `Generate a brief, friendly welcome message as ${agentData.name}. Introduce yourself and mention what you can help with based on your teaching focus. Keep it conversational and under 2 sentences.`;
      
      const response = await fetch(`https://lcdrsupwwitlvrvfrgsl.supabase.co/functions/v1/chat-completion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: welcomePrompt }],
          agent: agentData
        })
      });

      console.log('Welcome message response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        const welcomeMessage: Message = {
          id: 'welcome',
          role: 'assistant',
          content: data.content,
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);
      } else {
        const errorText = await response.text();
        console.error('Welcome message error:', errorText);
        // Fallback to generic message if OpenAI fails
        const welcomeMessage: Message = {
          id: 'welcome',
          role: 'assistant',
          content: `Hi! I'm ${agentData.name}, your ${agentData.type.toLowerCase()}. ${agentData.description || 'I\'m here to help you learn!'} How can I assist you today?`,
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);
      }
    } catch (error) {
      console.error('Error generating welcome message:', error);
      // Fallback to generic message
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: `Hi! I'm ${agentData.name}, your ${agentData.type.toLowerCase()}. ${agentData.description || 'I\'m here to help you learn!'} How can I assist you today?`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isSending || !agent) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsSending(true);

    try {
      console.log('Sending message to agent:', agent.name);
      // Prepare conversation history for OpenAI
      const conversationHistory = [...messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await fetch(`https://lcdrsupwwitlvrvfrgsl.supabase.co/functions/v1/chat-completion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: conversationHistory,
          agent: agent
        })
      });

      console.log('Message response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.content,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        const errorText = await response.text();
        console.error('Message error:', errorText);
        throw new Error('Failed to get response from tutor');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTranscriptUpdate = (transcript: string, isFromUser: boolean) => {
    if (!transcript.trim()) return;

    const messageId = isFromUser ? `user-voice-${Date.now()}` : `assistant-voice-${Date.now()}`;
    const newMessage: Message = {
      id: messageId,
      role: isFromUser ? 'user' : 'assistant',
      content: transcript,
      timestamp: new Date(),
      isVoice: true
    };

    setMessages(prev => {
      // Update existing message if it's the same voice session
      const lastMessage = prev[prev.length - 1];
      if (lastMessage && lastMessage.role === newMessage.role && lastMessage.isVoice) {
        return [...prev.slice(0, -1), newMessage];
      }
      return [...prev, newMessage];
    });
  };

  const handleSpeakingChange = (speaking: boolean) => {
    setIsSpeaking(speaking);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading tutor...</span>
        </div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <div>
                <h3 className="font-semibold">Tutor Not Available</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {error}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border-2 border-primary/20">
                <AvatarImage src={agent.avatar} alt={agent.name} />
                <AvatarFallback>
                  <Bot className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-xl font-semibold">{agent.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {agent.type} • {agent.subject || 'General'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {isSpeaking && (
                <Badge variant="secondary" className="animate-pulse">
                  <Bot className="h-3 w-3 mr-1" />
                  Speaking...
                </Badge>
              )}
              <Button
                onClick={() => setIsVoiceModeEnabled(!isVoiceModeEnabled)}
                variant={isVoiceModeEnabled ? "default" : "outline"}
                size="sm"
              >
                {isVoiceModeEnabled ? (
                  <>
                    <Mic className="h-4 w-4 mr-2" />
                    Voice Chat
                  </>
                ) : (
                  <>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Text Chat
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-6">
        <div className="space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
                  <AvatarImage src={agent.avatar} alt={agent.name} />
                  <AvatarFallback>
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
              
              <div
                className={`rounded-lg px-4 py-3 max-w-[80%] ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <div className="flex items-start justify-between">
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  {message.isVoice && (
                    <Mic className="h-3 w-3 ml-2 mt-1 opacity-50 flex-shrink-0" />
                  )}
                </div>
                <div className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          
          {isSending && (
            <div className="flex gap-3 justify-start">
              <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
                <AvatarImage src={agent.avatar} alt={agent.name} />
                <AvatarFallback>
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-lg px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Text Input - only show when voice mode is disabled */}
      {!isVoiceModeEnabled && (
        <div className="border-t bg-card/50 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="relative">
              <Textarea
                placeholder={`Ask ${agent.name} a question...`}
                className="min-h-[60px] max-h-[120px] resize-none pr-12 py-3"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isSending}
              />
              <Button
                size="icon"
                className="absolute bottom-3 right-3 h-8 w-8 rounded-full"
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isSending}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-xs text-muted-foreground mt-2 text-center">
              Press Enter to send • Shift + Enter for new line
            </div>
          </div>
        </div>
      )}

      {/* Voice Interface - show when voice mode is enabled */}
      {isVoiceModeEnabled && agent && (
        <VoiceInterface
          agent={agent}
          onTranscriptUpdate={handleTranscriptUpdate}
          onSpeakingChange={handleSpeakingChange}
        />
      )}
    </div>
  );
};

export default StudentChat;
