import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Copy, Settings, BarChart3, MessageSquare, Phone, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { useAgentDetails } from '@/hooks/useAgentDetails';
import AgentConfigSettings from '@/components/AgentConfigSettings';
import StudentUsageStats from '@/components/StudentUsageStats';
import RolePlayDialog from '@/components/RolePlayDialog';
import CallInterface from '@/components/CallInterface';
import { ThemeToggle } from '@/components/ThemeToggle';

const AgentDetails = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const { toast } = useToast();
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-red-500">
        Error: {error}
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        No agent found.
      </div>
    );
  }

  const handleShareableLinkCopy = () => {
    const agentLink = `${window.location.origin}/agents/${agentId}`;
    navigator.clipboard.writeText(agentLink);
    toast({
      title: "Link Copied!",
      description: "Share this link to showcase your AI Tutor.",
    });
  };

  if (isDirectCallActive && directCallInfo) {
    return (
      <CallInterface
        agent={agent!}
        phoneNumber={directCallInfo.phoneNumber}
        deviceSettings={directCallInfo.deviceSettings}
        onEndCall={endDirectCall}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <Link to="/agents" className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tutors
        </Link>
        <ThemeToggle />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center">
            <Avatar className="mr-4 h-12 w-12">
              <AvatarImage src={agent.avatar} alt={agent.name} />
              <AvatarFallback>
                <Bot className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl font-semibold">{agent.name}</CardTitle>
              <CardDescription className="text-muted-foreground">
                {agent.description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-muted-foreground text-sm">
                Type: <Badge variant="secondary">{agent.type}</Badge>
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                Created: {new Date(agent.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <Badge className="mr-2">
                <Users className="h-3 w-3 mr-1" />
                {agent.studentsSaved}+ Students Saved
              </Badge>
              <Badge>
                <TrendingUp className="h-3 w-3 mr-1" />
                {agent.helpfulnessScore}/10 Helpfulness
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Shareable Link</CardTitle>
          <CardDescription>
            Share this link to showcase your AI Tutor
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {window.location.origin}/agents/{agentId}
          </div>
          <Button variant="outline" size="sm" onClick={handleShareableLinkCopy}>
            <Copy className="h-4 w-4 mr-2" />
            Copy Link
          </Button>
        </CardContent>
      </Card>

      <Tabs defaultValue="usage" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="usage" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Student Usage
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="test" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Test Tutor
          </TabsTrigger>
        </TabsList>

        <TabsContent value="usage">
          <StudentUsageStats agent={agent} />
        </TabsContent>

        <TabsContent value="settings">
          <AgentConfigSettings 
            agent={agent} 
            onAgentUpdate={(updatedAgent) => {
              // Handle agent update if needed
            }}
            showSuccessToast={showSuccessToast}
          />
        </TabsContent>

        <TabsContent value="test">
          <Card>
            <CardHeader>
              <CardTitle>Test Your Tutor</CardTitle>
              <CardDescription>
                Try out different ways to interact with your AI tutor before sharing with students
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={openRolePlay}
                  className="flex items-center justify-center gap-2 h-24"
                  variant="outline"
                >
                  <MessageSquare className="h-6 w-6" />
                  <div>
                    <div className="font-medium">Chat Test</div>
                    <div className="text-sm text-muted-foreground">Test via text chat</div>
                  </div>
                </Button>
                
                <Button 
                  onClick={() => {/* Handle voice test */}}
                  className="flex items-center justify-center gap-2 h-24"
                  variant="outline"
                >
                  <Phone className="h-6 w-6" />
                  <div>
                    <div className="font-medium">Voice Test</div>
                    <div className="text-sm text-muted-foreground">Test via phone call</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <RolePlayDialog
        agent={agent}
        isOpen={isRolePlayOpen}
        onClose={closeRolePlay}
        onStartDirectCall={startDirectCall}
      />
    </div>
  );
};

export default AgentDetails;
