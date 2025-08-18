
import { useParams, useNavigate } from "react-router-dom";
import { useAgentDetails } from "@/hooks/useAgentDetails";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Bot, Phone, MessageCircle, Mail, Target, ChevronLeft, Users, TrendingUp, Clock, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import AgentConfigSettings from "@/components/AgentConfigSettings";
import { RolePlayDialog } from "@/components/RolePlayDialog";
import { CallInterface } from "@/components/CallInterface";

const AgentDetails = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const { 
    agent, 
    isLoading, 
    error, 
    isRolePlayOpen, 
    openRolePlay, 
    closeRolePlay,
    showSuccessToast,
    isDirectCallActive,
    directCallInfo,
    startDirectCall,
    endDirectCall
  } = useAgentDetails(agentId);

  const handleBack = () => {
    navigate('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="border-b bg-white">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-6 w-48" />
            </div>
          </div>
        </div>
        <div className="container mx-auto px-6 py-8 space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="border-b bg-white">
          <div className="container mx-auto px-6 py-4">
            <Button 
              variant="ghost" 
              onClick={handleBack}
              className="gap-2 text-slate-600 hover:text-slate-900"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>
        <div className="container mx-auto px-6 py-8">
          <Card className="max-w-md mx-auto border-slate-200">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <Bot className="h-12 w-12 text-red-500" />
                <div>
                  <h3 className="font-semibold text-slate-900">Tutor Not Found</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    {error || "The tutor you're looking for doesn't exist or you don't have permission to view it."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleAgentUpdate = (updatedAgent: any) => {
    console.log("Agent updated:", updatedAgent);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={handleBack}
              className="gap-2 text-slate-600 hover:text-slate-900 font-medium"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-1 rounded">
                <Bot className="h-3 w-3 text-white" />
              </div>
              <span className="text-sm font-medium text-slate-700">TeacherHub</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6 space-y-6">
        {/* Tutor Header */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <Avatar className="h-16 w-16 border-2 border-blue-100 shadow-md">
              <AvatarImage src={agent.avatar} alt={agent.name} />
              <AvatarFallback className="bg-blue-500 text-white">
                <Bot className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 mb-2">{agent.name}</h1>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge 
                      variant={agent.status === 'active' ? 'default' : 'secondary'}
                      className={agent.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' : ''}
                    >
                      {agent.status}
                    </Badge>
                    <span className="text-slate-600 font-medium text-sm">
                      {agent.type} • {agent.subject || 'General'}
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed mb-3">
                    {agent.description || "A helpful AI tutor designed to support student learning"}
                  </p>
                  
                  {agent.learningObjective && (
                    <div className="p-3 bg-green-50 rounded-md border border-green-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Target className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700">Learning Objective</span>
                      </div>
                      <p className="text-sm text-green-700">
                        {agent.learningObjective}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-1 gap-3 sm:min-w-[200px]">
                  <div className="bg-slate-50 rounded-lg p-3 text-center">
                    <Users className="h-5 w-5 text-slate-600 mx-auto mb-1" />
                    <div className="text-lg font-semibold text-slate-900">{agent.interactions || 0}</div>
                    <div className="text-xs text-slate-600">Student Interactions</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 text-center">
                    <Star className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
                    <div className="text-lg font-semibold text-slate-900">{agent.csat || 0}%</div>
                    <div className="text-xs text-slate-600">Satisfaction</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tutor Configuration - Takes up 2 columns */}
          <div className="lg:col-span-2">
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-slate-900">Tutor Configuration</CardTitle>
                <CardDescription className="text-sm text-slate-600">
                  Customize your tutor's behavior, voice, and teaching approach
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AgentConfigSettings 
                  agent={agent}
                  onAgentUpdate={handleAgentUpdate}
                  showSuccessToast={showSuccessToast}
                  showTeachingInstructions={true}
                />
              </CardContent>
            </Card>
          </div>

          {/* Usage Overview - Takes up 1 column */}
          <div className="space-y-6">
            {/* Communication Channels */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-slate-900">Available Channels</CardTitle>
                <CardDescription className="text-sm text-slate-600">
                  How students can interact with this tutor
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <MessageCircle className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900 text-sm">Chat Interface</h4>
                      <p className="text-xs text-slate-600">Text conversations</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">Active</Badge>
                </div>
                
                {agent.phone && (
                  <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-100 p-2 rounded-lg">
                        <Phone className="h-4 w-4 text-slate-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900 text-sm">Phone</h4>
                        <p className="text-xs text-slate-600">{agent.phone}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">Available</Badge>
                  </div>
                )}
                
                {agent.email && (
                  <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-100 p-2 rounded-lg">
                        <Mail className="h-4 w-4 text-slate-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900 text-sm">Email</h4>
                        <p className="text-xs text-slate-600">{agent.email}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">Available</Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-slate-900">Recent Activity</CardTitle>
                <CardDescription className="text-sm text-slate-600">
                  Latest student interactions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <Clock className="h-4 w-4 text-slate-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">Math problem assistance</p>
                    <p className="text-xs text-slate-600">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <Clock className="h-4 w-4 text-slate-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">Study session</p>
                    <p className="text-xs text-slate-600">15 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <Clock className="h-4 w-4 text-slate-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">Homework help</p>
                    <p className="text-xs text-slate-600">1 hour ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Summary */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-slate-900">Performance</CardTitle>
                <CardDescription className="text-sm text-slate-600">
                  Key metrics for this tutor
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">AVM Score</span>
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-semibold text-slate-900">{agent.avmScore || 8.5}/10</div>
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Response Time</span>
                  <div className="text-sm font-semibold text-slate-900">1.2s avg</div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Success Rate</span>
                  <div className="text-sm font-semibold text-slate-900">{agent.performance || 92}%</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Role Play Dialog */}
      <RolePlayDialog
        open={isRolePlayOpen}
        onOpenChange={(open) => open ? openRolePlay() : closeRolePlay()}
      />

      {/* Direct Call Interface */}
      {isDirectCallActive && directCallInfo && (
        <CallInterface
          open={isDirectCallActive}
          onOpenChange={(open) => !open && endDirectCall()}
          persona={null}
          directCallInfo={directCallInfo}
        />
      )}
    </div>
  );
};

export default AgentDetails;
