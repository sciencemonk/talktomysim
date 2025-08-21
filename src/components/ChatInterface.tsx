
import { useState, useRef, useEffect } from 'react';
import { Send, ArrowLeft, Phone, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AgentType } from '@/types/agent';
import { useTextChat } from '@/hooks/useTextChat';
import { useVoiceChat } from '@/hooks/useVoiceChat';
import { VerificationBadge } from './VerificationBadge';

interface ChatInterfaceProps {
  agent: AgentType;
  onBack?: () => void;
}

const ChatInterface = ({ agent, onBack }: ChatInterfaceProps) => {
  const [message, setMessage] = useState('');
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { 
    messages, 
    isLoading: isTextLoading, 
    sendMessage: sendTextMessage 
  } = useTextChat(agent.id);
  
  const {
    isConnected,
    isRecording,
    startVoiceChat,
    stopVoiceChat,
    toggleMute
  } = useVoiceChat(agent.id);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || isTextLoading) return;
    
    const messageToSend = message;
    setMessage('');
    await sendTextMessage(messageToSend);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleVoiceMode = () => {
    if (isVoiceMode) {
      stopVoiceChat();
    } else {
      startVoiceChat();
    }
    setIsVoiceMode(!isVoiceMode);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-card">
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        
        <Avatar className="h-10 w-10">
          <AvatarImage src={agent.avatar} alt={agent.name} />
          <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-lg">{agent.name}</h1>
            <VerificationBadge isVerified={agent.is_verified || false} />
          </div>
          {agent.title && (
            <p className="text-sm text-muted-foreground">{agent.title}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={isVoiceMode ? "destructive" : "outline"}
            size="sm"
            onClick={toggleVoiceMode}
            className="gap-2"
          >
            <Phone className="h-4 w-4" />
            {isVoiceMode ? "End Call" : "Voice Call"}
          </Button>
        </div>
      </div>

      {/* Voice Mode Indicator */}
      {isVoiceMode && (
        <div className="p-4 bg-muted/50 border-b">
          <div className="flex items-center justify-center gap-4">
            <Badge variant={isConnected ? "default" : "secondary"}>
              {isConnected ? "Connected" : "Connecting..."}
            </Badge>
            
            <Button
              variant="outline"
              size="sm"
              onClick={toggleMute}
              className="gap-2"
            >
              {isRecording ? (
                <>
                  <Mic className="h-4 w-4" />
                  Mute
                </>
              ) : (
                <>
                  <MicOff className="h-4 w-4" />
                  Unmute
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex gap-3 ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.role === 'assistant' && (
              <Avatar className="h-8 w-8 mt-1">
                <AvatarImage src={agent.avatar} alt={agent.name} />
                <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
              </Avatar>
            )}
            
            <Card className={`max-w-[80%] ${
              msg.role === 'user' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted'
            }`}>
              <CardContent className="p-3">
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </CardContent>
            </Card>
            
            {msg.role === 'user' && (
              <Avatar className="h-8 w-8 mt-1">
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
        
        {isTextLoading && (
          <div className="flex gap-3">
            <Avatar className="h-8 w-8 mt-1">
              <AvatarImage src={agent.avatar} alt={agent.name} />
              <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <Card className="bg-muted">
              <CardContent className="p-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {!isVoiceMode && (
        <div className="p-4 border-t bg-card">
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Message ${agent.name}...`}
              className="flex-1"
              disabled={isTextLoading}
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!message.trim() || isTextLoading}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
