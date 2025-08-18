
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Bot, MessageCircle, ArrowLeft, Mic, MicOff, Info } from "lucide-react";
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
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="max-w-4xl mx-auto">
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-32 w-full" />
                </div>
              </CardContent>
            </Card>
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleBack}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Directory
              </Button>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-gray-200 dark:border-gray-700">
                  <AvatarImage src={agent.avatar} alt={agent.name} />
                  <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
                    <Bot className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="font-semibold text-gray-900 dark:text-white">{agent.name}</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{agent.type}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleViewDetails}
                className="border-gray-300 dark:border-gray-600"
              >
                <Info className="h-4 w-4 mr-2" />
                View Details
              </Button>
              <Button 
                variant={isVoiceActive ? "destructive" : "default"}
                size="sm"
                onClick={toggleVoice}
                className={isVoiceActive ? "" : "bg-blue-600 hover:bg-blue-700"}
              >
                {isVoiceActive ? (
                  <>
                    <MicOff className="h-4 w-4 mr-2" />
                    End Session
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4 mr-2" />
                    Start Voice Chat
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {!isVoiceActive ? (
            /* Welcome Screen */
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader className="text-center pb-6">
                <div className="flex justify-center mb-4">
                  <Avatar className="h-20 w-20 border-4 border-gray-200 dark:border-gray-700">
                    <AvatarImage src={agent.avatar} alt={agent.name} />
                    <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
                      <Bot className="h-10 w-10" />
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="text-2xl text-gray-900 dark:text-white mb-2">
                  Ready to Learn with {agent.name}?
                </CardTitle>
                <CardDescription className="text-base max-w-2xl mx-auto">
                  {agent.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="text-center">
                <div className="flex flex-wrap justify-center gap-2 mb-8">
                  {agent.subject && (
                    <Badge variant="secondary" className="text-sm">
                      {agent.subject}
                    </Badge>
                  )}
                  {agent.gradeLevel && (
                    <Badge variant="outline" className="text-sm">
                      {agent.gradeLevel}
                    </Badge>
                  )}
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    How to get started:
                  </h3>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 text-left max-w-md mx-auto">
                    <li>• Click "Start Voice Chat" to begin speaking with your AI tutor</li>
                    <li>• Ask questions naturally - no special commands needed</li>
                    <li>• The tutor will adapt to your learning pace and style</li>
                    <li>• You can end the session anytime by clicking "End Session"</li>
                  </ul>
                </div>

                <Button 
                  onClick={toggleVoice}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                >
                  <Mic className="h-5 w-5 mr-2" />
                  Start Voice Chat
                </Button>
              </CardContent>
            </Card>
          ) : (
            /* Voice Chat Interface */
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader className="bg-blue-50 dark:bg-blue-950/30 border-b border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border-2 border-blue-200 dark:border-blue-700">
                      <AvatarImage src={agent.avatar} alt={agent.name} />
                      <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
                        <Bot className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg text-blue-900 dark:text-blue-100">
                        Chatting with {agent.name}
                      </CardTitle>
                      <CardDescription className="text-blue-700 dark:text-blue-300">
                        {isSpeaking ? "Speaking..." : "Listening..."}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${isSpeaking ? 'bg-green-500 animate-pulse' : 'bg-blue-500'}`} />
                    <span className="text-sm text-blue-700 dark:text-blue-300">
                      {isSpeaking ? "AI Speaking" : "Your Turn"}
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                {/* Voice Interface Component */}
                {agent && (
                  <VoiceInterface 
                    agent={agent}
                    onTranscriptUpdate={handleTranscriptUpdate}
                    onSpeakingChange={handleSpeakingChange}
                  />
                )}

                {/* Display transcript if available */}
                {transcript && (
                  <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Latest Transcript:</h4>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">{transcript}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentChat;
