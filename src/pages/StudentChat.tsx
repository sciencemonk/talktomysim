
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Info, PhoneOff, Bot } from "lucide-react";
import { useAgentDetails } from "@/hooks/useAgentDetails";
import { Skeleton } from "@/components/ui/skeleton";
import VoiceInterface from "@/components/VoiceInterface";
import { ChatInterface } from "@/components/ChatInterface";
import { useMessageAccumulator } from "@/hooks/useMessageAccumulator";

const StudentChat = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const { agent, isLoading, error } = useAgentDetails(agentId);
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const { messages, addMessageFragment, completeCurrentMessage, resetMessages } = useMessageAccumulator();

  const handleBack = () => {
    navigate('/');
  };

  const handleViewDetails = () => {
    navigate(`/tutors/${agentId}`);
  };

  const handleTranscriptUpdate = (transcript: string, isFromUser: boolean) => {
    addMessageFragment(transcript, isFromUser);
  };

  const handleSpeakingChange = (speaking: boolean) => {
    setIsSpeaking(speaking);
    if (!speaking) {
      // Complete the current message when speaking stops
      completeCurrentMessage();
    }
  };

  const handleConnectionChange = (connected: boolean) => {
    setIsConnected(connected);
    if (!connected) {
      resetMessages();
    }
  };

  const handleConnectionStatusChange = (status: string) => {
    setConnectionStatus(status);
  };

  const handleEndCall = () => {
    setIsConnected(false);
    setIsSpeaking(false);
    setConnectionStatus('disconnected');
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
          <ChatInterface
            agent={agent}
            messages={messages}
            isConnected={isConnected}
            isSpeaking={isSpeaking}
            connectionStatus={connectionStatus}
          />
        </div>
      </div>

      {/* Voice Interface (Hidden) */}
      {agent && (
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
