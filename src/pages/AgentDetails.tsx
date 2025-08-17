
import { useParams } from "react-router-dom";
import { useAgentDetails } from "@/hooks/useAgentDetails";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, Phone, MessageCircle, Mail, User, Target, BarChart3, Settings, Loader2, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import AgentConfigSettings from "@/components/AgentConfigSettings";
import AgentStats from "@/components/AgentStats";
import AnalyticsTab from "@/components/AnalyticsTab";
import RolePlayDialog from "@/components/RolePlayDialog";
import CallInterface from "@/components/CallInterface";

const AgentDetails = () => {
  const { agentId } = useParams<{ agentId: string }>();
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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
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
    );
  }

  if (error || !agent) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <div>
                <h3 className="font-semibold">Tutor Not Found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {error || "The tutor you're looking for doesn't exist or you don't have permission to view it."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleAgentUpdate = (updatedAgent: any) => {
    // This will be handled by the component's internal state management
    console.log("Agent updated:", updatedAgent);
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-2 border-primary/20">
            <AvatarImage src={agent.avatar} alt={agent.name} />
            <AvatarFallback>
              <Bot className="h-8 w-8 sm:h-10 sm:w-10" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{agent.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
                {agent.status}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {agent.type} • {agent.subject || 'General'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <AgentStats agent={agent} />

      {/* Main Content */}
      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
          <TabsTrigger value="channels" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Channels</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          <AgentConfigSettings 
            agent={agent}
            onAgentUpdate={handleAgentUpdate}
            showSuccessToast={showSuccessToast}
            showTeachingInstructions={true} // Show teaching instructions on detail page
          />
        </TabsContent>

        <TabsContent value="channels" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Communication Channels</CardTitle>
              <CardDescription>
                Configure how students can interact with your tutor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <MessageCircle className="h-5 w-5 text-primary" />
                    <div>
                      <h4 className="font-medium">Chat</h4>
                      <p className="text-sm text-muted-foreground">Text-based conversations</p>
                    </div>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>
                
                {agent.phone && (
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-primary" />
                      <div>
                        <h4 className="font-medium">Phone</h4>
                        <p className="text-sm text-muted-foreground">{agent.phone}</p>
                      </div>
                    </div>
                    <Badge variant="secondary">Configured</Badge>
                  </div>
                )}
                
                {agent.email && (
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-primary" />
                      <div>
                        <h4 className="font-medium">Email</h4>
                        <p className="text-sm text-muted-foreground">{agent.email}</p>
                      </div>
                    </div>
                    <Badge variant="secondary">Configured</Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <AnalyticsTab agent={agent} />
        </TabsContent>
      </Tabs>

      {/* Role Play Dialog */}
      <RolePlayDialog
        isOpen={isRolePlayOpen}
        onClose={closeRolePlay}
        agent={agent}
        onStartDirectCall={startDirectCall}
      />

      {/* Direct Call Interface */}
      {isDirectCallActive && directCallInfo && (
        <CallInterface
          agent={agent}
          phoneNumber={directCallInfo.phoneNumber}
          deviceSettings={directCallInfo.deviceSettings}
          onEndCall={endDirectCall}
        />
      )}
    </div>
  );
};

export default AgentDetails;
