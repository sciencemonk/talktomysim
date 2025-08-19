
import { useParams, useNavigate } from "react-router-dom";
import { useAgentDetails } from "@/hooks/useAgentDetails";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Bot, Target, ChevronLeft, MessageCircle, Clock, Eye } from "lucide-react";
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

  const handleViewChat = () => {
    if (agentId) {
      navigate(`/tutors/${agentId}/chat`);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-slate-50">
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
      </div>;
  }

  if (error || !agent) {
    return <div className="min-h-screen bg-slate-50">
        <div className="border-b bg-white">
          <div className="container mx-auto px-6 py-4">
            <Button variant="ghost" onClick={handleBack} className="gap-2 text-slate-600 hover:text-slate-900">
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
                  <h3 className="font-semibold text-slate-900">Thinking Partner Not Found</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    {error || "The thinking partner you're looking for doesn't exist or you don't have permission to view it."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>;
  }

  const handleAgentUpdate = (updatedAgent: any) => {
    console.log("Thinking partner updated:", updatedAgent);
  };

  return <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={handleBack} className="gap-2 text-slate-600 hover:text-slate-900 font-medium">
              <ChevronLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            
            <Button onClick={handleViewChat} className="gap-2">
              <Eye className="h-4 w-4" />
              View Chat
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6 space-y-6">
        {/* Thinking Partner Header */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <Avatar className="h-16 w-16 border-2 border-blue-100 shadow-md">
              <AvatarImage src={agent.avatar} alt={agent.name} />
              <AvatarFallback className="bg-blue-500 text-white">
                <Bot className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-900 mb-2">{agent.name}</h1>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant={agent.status === 'active' ? 'default' : 'secondary'} className={agent.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' : ''}>
                  {agent.status}
                </Badge>
                <span className="text-slate-600 font-medium text-sm">
                  {agent.type} • {agent.subject || 'General'}
                </span>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed mb-3">
                {agent.description || "A helpful AI thinking partner designed to support your child's learning"}
              </p>
              
              {agent.learningObjective && <div className="p-3 bg-green-50 rounded-md border border-green-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">Learning Objective</span>
                  </div>
                  <p className="text-sm text-green-700">
                    {agent.learningObjective}
                  </p>
                </div>}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration - Takes up 2 columns */}
          <div className="lg:col-span-2">
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-slate-900">Thinking Partner Configuration</CardTitle>
                <CardDescription className="text-sm text-slate-600">
                  Customize your child's thinking partner behavior and teaching approach
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AgentConfigSettings agent={agent} onAgentUpdate={handleAgentUpdate} showSuccessToast={showSuccessToast} showTeachingInstructions={true} />
              </CardContent>
            </Card>
          </div>

          {/* Activity Overview - Takes up 1 column */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-slate-900">Quick Actions</CardTitle>
                <CardDescription className="text-sm text-slate-600">
                  Manage your child's thinking partner
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={handleViewChat}
                  className="w-full gap-2"
                  variant="outline"
                >
                  <MessageCircle className="h-4 w-4" />
                  View Chat History
                </Button>
                
                <Button 
                  onClick={openRolePlay}
                  className="w-full gap-2"
                  variant="outline"
                >
                  <Bot className="h-4 w-4" />
                  Test Conversation
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-slate-900">Recent Activity</CardTitle>
                <CardDescription className="text-sm text-slate-600">
                  Latest conversations with your child
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <Clock className="h-4 w-4 text-slate-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">Learning session</p>
                    <p className="text-xs text-slate-600">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <Clock className="h-4 w-4 text-slate-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">Question & answer</p>
                    <p className="text-xs text-slate-600">15 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <Clock className="h-4 w-4 text-slate-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">Exploration chat</p>
                    <p className="text-xs text-slate-600">1 hour ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Usage Summary */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-slate-900">Usage Summary</CardTitle>
                <CardDescription className="text-sm text-slate-600">
                  Overview of conversations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Total Conversations</span>
                  <div className="text-sm font-semibold text-slate-900">{agent.interactions || 0}</div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">This Week</span>
                  <div className="text-sm font-semibold text-slate-900">12</div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Average Duration</span>
                  <div className="text-sm font-semibold text-slate-900">8 min</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Role Play Dialog */}
      <RolePlayDialog open={isRolePlayOpen} onOpenChange={open => open ? openRolePlay() : closeRolePlay()} />

      {/* Direct Call Interface */}
      {isDirectCallActive && directCallInfo && <CallInterface open={isDirectCallActive} onOpenChange={open => !open && endDirectCall()} persona={null} directCallInfo={directCallInfo} />}
    </div>;
};

export default AgentDetails;
