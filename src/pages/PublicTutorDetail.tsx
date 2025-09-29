
import { useParams, useNavigate } from "react-router-dom";
import { usePublicAgent } from "@/hooks/usePublicAgent";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import BotCheck from "@/components/BotCheck";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bot, MessageCircle, Target, Users, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const PublicTutorDetail = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const { agent, isLoading, error } = usePublicAgent(agentId);
  const [showBotCheck, setShowBotCheck] = useState(false);

  const handleStartChat = () => {
    setShowBotCheck(true);
  };

  const handleBotCheckComplete = () => {
    setShowBotCheck(false);
    if (agentId) {
      navigate(`/tutors/${agentId}/chat`);
    }
  };

  const handleBotCheckCancel = () => {
    setShowBotCheck(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="container mx-auto px-6 py-8 space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="container mx-auto px-6 py-8">
          <Card className="max-w-md mx-auto border-slate-200">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <Bot className="h-12 w-12 text-red-500" />
                <div>
                  <h3 className="font-semibold text-slate-900">Tutor Not Found</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    {error || "The tutor you're looking for doesn't exist."}
                  </p>
                </div>
                <Button onClick={() => navigate('/')} variant="outline">
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-6 py-8 space-y-6">
        {/* Tutor Header */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-6">
            <Avatar className="h-20 w-20 border-2 border-blue-100 shadow-md">
              <AvatarImage src={agent.avatar} alt={agent.name} />
              <AvatarFallback className="bg-blue-500 text-white">
                <Bot className="h-10 w-10" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 mb-3">{agent.name}</h1>
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant={agent.status === 'active' ? 'default' : 'secondary'} 
                           className={agent.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' : ''}>
                      {agent.status}
                    </Badge>
                    <span className="text-slate-600 font-medium">
                      {agent.type} • {agent.subject || 'General'}
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed mb-4">
                    {agent.description || "A helpful AI tutor designed to support student learning"}
                  </p>
                  
                  {agent.learningObjective && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="h-5 w-5 text-green-600" />
                        <span className="font-medium text-green-700">Learning Objective</span>
                      </div>
                      <p className="text-green-700">
                        {agent.learningObjective}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-1 gap-3 sm:min-w-[200px]">
                  <div className="bg-slate-50 rounded-lg p-4 text-center">
                    <Users className="h-6 w-6 text-slate-600 mx-auto mb-2" />
                    <div className="text-xl font-semibold text-slate-900">{agent.interactions || 0}</div>
                    <div className="text-sm text-slate-600">Student Interactions</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4 text-center">
                    <Star className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                    <div className="text-xl font-semibold text-slate-900">{agent.csat || 0}%</div>
                    <div className="text-sm text-slate-600">Satisfaction</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Section */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-semibold text-slate-900">Ready to Learn?</CardTitle>
            <CardDescription className="text-slate-600">
              Start a conversation with {agent.name} and get personalized help with your studies
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button 
              onClick={handleStartChat} 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Start Chat with {agent.name}
            </Button>
          </CardContent>
        </Card>

        {/* Additional Info */}
        {(agent.teachingStyle || agent.gradeLevel) && (
          <Card className="shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900">About This Tutor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {agent.teachingStyle && (
                <div>
                  <h4 className="font-medium text-slate-900 mb-1">Teaching Style</h4>
                  <p className="text-slate-600">{agent.teachingStyle}</p>
                </div>
              )}
              {agent.gradeLevel && (
                <div>
                  <h4 className="font-medium text-slate-900 mb-1">Grade Level</h4>
                  <p className="text-slate-600">{agent.gradeLevel}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {showBotCheck && (
        <BotCheck
          onVerificationComplete={handleBotCheckComplete}
          onCancel={handleBotCheckCancel}
        />
      )}
    </div>
  );
};

export default PublicTutorDetail;
