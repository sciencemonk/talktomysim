
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
    addAiMessage, 
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

  const handleTranscriptUpdate = (transcript: string, isFromUser: boolean) => {
    console.log('Received complete transcript:', { transcript, isFromUser });
    
    if (transcript.trim()) {
      if (isFromUser) {
        addUserMessage(transcript);
      } else {
        addAiMessage(transcript);
      }
    }
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
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="max-w-4xl mx-auto h-96">
            <Skeleton className="h-full w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBack}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Directory
            </Button>
          </div>
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="bg-red-100 dark:bg-red-900/30 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <Bot className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Tutor Not Found</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The AI tutor you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={handleBack} className="bg-blue-600 hover:bg-blue-700">
              Browse All Tutors
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Top Navigation */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBack}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Directory
            </Button>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleViewDetails}
                className="border-gray-300 dark:border-gray-600"
              >
                <Info className="h-4 w-4 mr-2" />
                Details
              </Button>
              
              {isConnected && (
                <Button 
                  variant="destructive"
                  size="sm"
                  onClick={handleEndCall}
                >
                  <PhoneOff className="h-4 w-4 mr-2" />
                  End Session
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 container mx-auto px-6 py-4 max-w-6xl">
        <div className="h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {!hasStarted ? (
            <div className="h-full flex flex-col items-center justify-center p-8">
              <div className="text-center mb-8">
                <div className="w-32 h-32 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <Bot className="w-16 h-16 text-blue-600 dark:text-blue-400" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Ready to learn with {agent.name}?
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
                  {agent.description || `Your ${agent.type.toLowerCase()} for ${agent.subject || 'learning'}`}
                </p>
                {agent.learningObjective && (
                  <p className="text-lg text-gray-500 dark:text-gray-500 mb-8">
                    Today's focus: {agent.learningObjective}
                  </p>
                )}
              </div>
              
              <Button 
                onClick={handleStartChat}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
              >
                <Play className="w-6 h-6 mr-3" />
                Start Learning Session
              </Button>
              
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center max-w-md">
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
          onTranscriptUpdate={handleTranscriptUpdate}
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
