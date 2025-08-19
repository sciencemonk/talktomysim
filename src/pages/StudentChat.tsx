import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Info, PhoneOff, Bot, Play } from "lucide-react";
import { useAgentDetails } from "@/hooks/useAgentDetails";
import { Skeleton } from "@/components/ui/skeleton";
import VoiceInterface from "@/components/VoiceInterface";
import { ChatInterface } from "@/components/ChatInterface";
import { useSimpleMessageAccumulator } from "@/hooks/useSimpleMessageAccumulator";

const StudentChat = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const { agent, isLoading, error } = useAgentDetails(agentId);
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [hasStarted, setHasStarted] = useState(false);
  
  const { 
    messages, 
    addUserMessage,
    startAiMessage,
    addAiTextDelta,
    completeAiMessage,
    resetMessages 
  } = useSimpleMessageAccumulator();

  const handleBack = () => {
    navigate('/');
  };

  const handleViewDetails = () => {
    navigate(`/tutors/${agentId}`);
  };

  const handleStartChat = () => {
    console.log('Starting chat session...');
    setHasStarted(true);
    resetMessages();
  };

  const handleUserMessage = (message: string) => {
    console.log('Received user message:', message);
    addUserMessage(message);
  };

  const handleAiMessageStart = () => {
    console.log('AI message started');
    startAiMessage();
  };

  const handleAiTextDelta = (delta: string) => {
    console.log('AI text delta:', delta);
    addAiTextDelta(delta);
  };

  const handleAiMessageComplete = () => {
    console.log('AI message completed');
    completeAiMessage();
  };

  const handleSpeakingChange = (speaking: boolean) => {
    setIsSpeaking(speaking);
  };

  const handleConnectionChange = (connected: boolean) => {
    setIsConnected(connected);
    if (!connected) {
      resetMessages();
      setHasStarted(false);
    }
  };

  const handleConnectionStatusChange = (status: string) => {
    setConnectionStatus(status);
  };

  const handleEndCall = () => {
    setIsConnected(false);
    setIsSpeaking(false);
    setConnectionStatus('disconnected');
    setHasStarted(false);
    resetMessages();
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="max-w-4xl mx-auto h-96">
            <Skeleton className="h-full w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen bg-bg">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBack}
              className="text-fgMuted hover:text-fg"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Directory
            </Button>
          </div>
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="bg-gradient-to-br from-destructive/20 to-destructive/10 p-8 rounded-3xl w-32 h-32 mx-auto mb-6 flex items-center justify-center">
              <Bot className="h-12 w-12 text-destructive" />
            </div>
            <h1 className="text-xl font-semibold text-fg mb-2">Tutor Not Found</h1>
            <p className="text-fgMuted mb-6">
              The AI tutor you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={handleBack} className="bg-brandBlue hover:bg-brandBlue/90">
              Browse All Tutors
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg via-bgMuted to-bg flex flex-col">
      {/* Fixed Top Navigation with Apple styling */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-bg/80 backdrop-blur-xl border-b border-border/20 shadow-sm">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBack}
              className="text-fgMuted hover:text-fg hover:bg-bgMuted/50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Directory
            </Button>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleViewDetails}
                className="border-border/50 hover:bg-bgMuted/50"
              >
                <Info className="h-4 w-4 mr-2" />
                Details
              </Button>
              
              {isConnected && (
                <Button 
                  variant="destructive"
                  size="sm"
                  onClick={handleEndCall}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  <PhoneOff className="h-4 w-4 mr-2" />
                  End Session
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Interface with Apple styling */}
      <div className="flex-1 container mx-auto px-6 py-4 max-w-6xl mt-16">
        <div className="h-full bg-bg/60 backdrop-blur-xl rounded-3xl shadow-lg border border-border/20 overflow-hidden">
          {!hasStarted ? (
            <div className="h-full flex flex-col items-center justify-center p-8">
              <div className="text-center mb-8">
                <div className="w-32 h-32 bg-gradient-to-br from-brandBlue/20 to-brandPurple/20 rounded-3xl flex items-center justify-center mb-6 mx-auto">
                  <Bot className="w-16 h-16 text-brandBlue" />
                </div>
                <h1 className="text-3xl font-semibold text-fg mb-4">
                  Ready to learn with {agent.name}?
                </h1>
                <p className="text-xl text-fgMuted mb-2">
                  {agent.description || `Your ${agent.type.toLowerCase()} for ${agent.subject || 'learning'}`}
                </p>
                {agent.learningObjective && (
                  <p className="text-lg text-fgMuted mb-8">
                    Today's focus: {agent.learningObjective}
                  </p>
                )}
              </div>
              
              <Button 
                onClick={handleStartChat}
                size="lg"
                className="bg-gradient-to-r from-brandBlue to-brandPurple hover:opacity-90 text-white px-8 py-4 text-lg rounded-2xl shadow-lg"
              >
                <Play className="w-6 h-6 mr-3" />
                Start Learning Session
              </Button>
              
              <p className="text-sm text-fgMuted mt-4 text-center max-w-md">
                Click to begin your voice conversation. Make sure your microphone is enabled.
              </p>
            </div>
          ) : (
            <ChatInterface
              agent={agent}
              messages={messages}
              isConnected={isConnected}
              isSpeaking={isSpeaking}
              connectionStatus={connectionStatus}
            />
          )}
        </div>
      </div>

      {/* Voice Interface (Hidden) */}
      {agent && hasStarted && (
        <VoiceInterface 
          agent={agent}
          onUserMessage={handleUserMessage}
          onAiMessageStart={handleAiMessageStart}
          onAiTextDelta={handleAiTextDelta}
          onAiMessageComplete={handleAiMessageComplete}
          onSpeakingChange={handleSpeakingChange}
          onConnectionChange={handleConnectionChange}
          onConnectionStatusChange={handleConnectionStatusChange}
          autoStart={true}
        />
      )}
    </div>
  );
};

export default StudentChat;
