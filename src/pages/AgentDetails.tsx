
import { useParams, useNavigate } from "react-router-dom";
import { useAgentDetails } from "@/hooks/useAgentDetails";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, Phone, MessageCircle, Mail, User, Target, BarChart3, Settings, Loader2, AlertCircle, ArrowLeft, ChevronLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import AgentConfigSettings from "@/components/AgentConfigSettings";
import { AgentStats } from "@/components/AgentStats";
import AnalyticsTab from "@/components/AnalyticsTab";
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
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
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
                <AlertCircle className="h-12 w-12 text-red-500" />
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
      {/* Compact Header with Back Navigation */}
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
        {/* Compact Tutor Header */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-blue-100 shadow-md">
              <AvatarImage src={agent.avatar} alt={agent.name} />
              <AvatarFallback className="bg-blue-500 text-white">
                <Bot className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
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
              <p className="text-slate-600 text-sm leading-relaxed">
                {agent.description || "A helpful AI tutor designed to support student learning"}
              </p>
              
              {agent.learningObjective && (
                <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">Learning Objective</span>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    {agent.learningObjective}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Compact Stats Cards */}
        <AgentStats 
          avmScore={agent.avmScore}
          interactionCount={agent.interactions || 0}
          csat={agent.csat}
          performance={agent.performance}
        />

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <Tabs defaultValue="settings" className="w-full">
            <div className="border-b border-slate-200 bg-slate-50">
              <TabsList className="w-full bg-transparent border-none h-auto p-0">
                <TabsTrigger 
                  value="settings" 
                  className="flex-1 py-3 px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none border-b-2 border-transparent text-sm"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </TabsTrigger>
                <TabsTrigger 
                  value="channels" 
                  className="flex-1 py-3 px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none border-b-2 border-transparent text-sm"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Channels
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics" 
                  className="flex-1 py-3 px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none border-b-2 border-transparent text-sm"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="settings" className="p-6 space-y-4">
              <AgentConfigSettings 
                agent={agent}
                onAgentUpdate={handleAgentUpdate}
                showSuccessToast={showSuccessToast}
                showTeachingInstructions={true}
              />
            </TabsContent>

            <TabsContent value="channels" className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">Communication Channels</h3>
                  <p className="text-slate-600 text-sm">Configure how students can interact with your tutor</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <MessageCircle className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900 text-sm">Chat Interface</h4>
                        <p className="text-xs text-slate-600">Text-based conversations with students</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">Active</Badge>
                  </div>
                  
                  {agent.phone && (
                    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-100 p-2 rounded-lg">
                          <Phone className="h-4 w-4 text-slate-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-900 text-sm">Phone</h4>
                          <p className="text-xs text-slate-600">{agent.phone}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">Configured</Badge>
                    </div>
                  )}
                  
                  {agent.email && (
                    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-100 p-2 rounded-lg">
                          <Mail className="h-4 w-4 text-slate-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-900 text-sm">Email</h4>
                          <p className="text-xs text-slate-600">{agent.email}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">Configured</Badge>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="p-6">
              <AnalyticsTab agent={agent} />
            </TabsContent>
          </Tabs>
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
