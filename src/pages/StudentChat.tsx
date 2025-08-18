import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Bot, MessageCircle, ArrowLeft, Mic, MicOff } from "lucide-react";
import { useAgentDetails } from "@/hooks/useAgentDetails";
import { Skeleton } from "@/components/ui/skeleton";
import VoiceInterface from "@/components/VoiceInterface";

const StudentChat = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const { agent, isLoading, error } = useAgentDetails(agentId);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleBack = () => {
    navigate('/');
  };

  const handleViewDetails = () => {
    navigate(`/tutors/${agentId}`);
  };

  const toggleVoice = () => {
    setIsVoiceActive(!isVoiceActive);
  };

  const handleTranscriptUpdate = (newTranscript: string, isFromUser: boolean) => {
    setTranscript(newTranscript);
  };

  const handleSpeakingChange = (speaking: boolean) => {
    setIsSpeaking(speaking);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-10 w-32" />
            <div className="flex items-center gap-6">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-3">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <Bot className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Tutor Not Found
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              The tutor you're looking for doesn't exist or may have been removed.
            </p>
            <Button onClick={handleBack} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Directory
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Directory
              </Button>
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12 border-2 border-blue-100">
                  <AvatarImage src={agent.avatar} alt={agent.name} />
                  <AvatarFallback>
                    <Bot className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {agent.name}
                  </h1>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">{agent.type}</Badge>
                    {agent.subject && (
                      <Badge variant="outline" className="text-xs">{agent.subject}</Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleViewDetails}>
                View Details
              </Button>
              <Button
                onClick={toggleVoice}
                className={`${
                  isVoiceActive 
                    ? "bg-red-600 hover:bg-red-700" 
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isVoiceActive ? (
                  <>
                    <MicOff className="h-4 w-4 mr-2" />
                    End Voice Chat
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4 mr-2" />
                    Voice Chat
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Chat Interface */}
          <Card className="h-[calc(100vh-200px)]">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Free public chat session
                </CardTitle>
              </div>
            </CardHeader>
            
            <CardContent className="p-0 h-full">
              <div className="flex flex-col h-full">
                {/* Chat Messages Area */}
                <div className="flex-1 p-6 overflow-y-auto">
                  <div className="space-y-4">
                    {/* Welcome Message */}
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={agent.avatar} alt={agent.name} />
                        <AvatarFallback>
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 max-w-[80%]">
                        <p className="text-gray-900 dark:text-white">
                          Hey there! I'm {agent.name}, your friendly {agent.subject?.toLowerCase() || 'tutor'}, and I'm here to help you conquer all things {agent.subject?.toLowerCase() || 'learning'}, especially factorials and more. Let's dive in and make learning fun together!
                        </p>
                        <p className="text-xs text-gray-500 mt-2">07:45 AM</p>
                      </div>
                    </div>

                    {/* Display transcript if available */}
                    {transcript && (
                      <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        <div className="bg-blue-100 dark:bg-blue-900 rounded-lg p-4 max-w-[80%]">
                          <p className="text-gray-900 dark:text-white">{transcript}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Voice Interface */}
                {isVoiceActive && agent && (
                  <VoiceInterface 
                    agent={agent}
                    onTranscriptUpdate={handleTranscriptUpdate}
                    onSpeakingChange={handleSpeakingChange}
                  />
                )}

                {/* Start Voice Chat Button */}
                {!isVoiceActive && (
                  <div className="p-6 border-t text-center">
                    <Button 
                      onClick={toggleVoice}
                      className="bg-blue-600 hover:bg-blue-700"
                      size="lg"
                    >
                      Start Voice Chat
                    </Button>
                    <p className="text-sm text-gray-500 mt-2">
                      Click to start a voice conversation with {agent.name}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentChat;
