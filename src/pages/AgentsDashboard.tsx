import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAgents } from "@/hooks/useAgents";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Plus, 
  MoreVertical, 
  Bot, 
  Settings,
  Play,
  Link,
  MessageSquare,
  Clock
} from "lucide-react";
import { AgentType } from "@/types/agent";
import { toast } from "@/components/ui/use-toast";

const ThinkingPartnersDashboard = () => {
  const navigate = useNavigate();
  const { agents, isLoading, error } = useAgents();

  const handleCreateAgent = () => {
    navigate("/agents/create");
  };

  const handleAgentClick = (agentId: string) => {
    navigate(`/agents/${agentId}`);
  };

  const handleStartChat = (agentId: string) => {
    window.open(`/tutors/${agentId}/chat`, '_blank');
  };

  const handleCopyShareableLink = (agentId: string) => {
    const shareableLink = `${window.location.origin}/tutors/${agentId}/chat`;
    navigator.clipboard.writeText(shareableLink).then(() => {
      toast({
        title: "Link copied!",
        description: "Shareable link has been copied to clipboard."
      });
    });
  };

  const capitalizeFirst = (text: string) => {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  const formatUsageStats = (interactions: number, studentsHelped: number) => {
    if (interactions === 0 && studentsHelped === 0) {
      return "No activity yet";
    }
    
    const parts = [];
    if (interactions > 0) {
      parts.push(`${interactions} conversation${interactions !== 1 ? 's' : ''}`);
    }
    if (studentsHelped > 0) {
      parts.push(`${studentsHelped} child${studentsHelped !== 1 ? 'ren' : ''} helped`);
    }
    
    return parts.join(' • ');
  };

  const getLastActivityText = (createdAt: string, updatedAt?: string) => {
    const lastUpdate = updatedAt || createdAt;
    const date = new Date(lastUpdate);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Active today";
    if (diffInDays === 1) return "Active yesterday";
    if (diffInDays < 7) return `Active ${diffInDays} days ago`;
    if (diffInDays < 30) return `Active ${Math.floor(diffInDays / 7)} week${Math.floor(diffInDays / 7) !== 1 ? 's' : ''} ago`;
    return `Active ${Math.floor(diffInDays / 30)} month${Math.floor(diffInDays / 30) !== 1 ? 's' : ''} ago`;
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-8 p-4 md:p-8 pt-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Card className="w-full max-w-md mx-auto rounded-2xl border-border/30">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <Bot className="h-12 w-12 text-red-500" />
              <div>
                <h3 className="font-semibold text-fg">Failed to load thinking partners</h3>
                <p className="text-sm text-fgMuted mt-1">
                  {error || "Something went wrong. Please try again."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6">
      {/* Thinking Partners Grid with Create Tile */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* Create New Thinking Partner Tile */}
        <Card 
          onClick={handleCreateAgent}
          className="border-border/30 hover:shadow-lg hover:border-border/50 transition-all duration-300 group rounded-2xl bg-card overflow-hidden cursor-pointer border-2 border-dashed"
        >
          <CardContent className="pt-16 pb-16">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Plus className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-fg mb-2">
                  New Thinking Partner
                </h3>
                <p className="text-sm text-fgMuted leading-relaxed">
                  Create a personalized AI learning assistant
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Existing Thinking Partners */}
        {agents.map((agent: AgentType) => (
          <Card 
            key={agent.id} 
            className="border-border/30 hover:shadow-lg hover:border-border/50 transition-all duration-300 group rounded-2xl bg-card overflow-hidden"
          >
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <Avatar className="h-12 w-12 border border-border/20 rounded-xl">
                  <AvatarImage src={agent.avatar} alt={agent.name} />
                  <AvatarFallback className="bg-primary/10 text-primary rounded-xl">
                    <Bot className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg font-medium text-fg truncate leading-tight">{agent.name}</CardTitle>
                  {agent.subject && (
                    <p className="text-sm text-fgMuted truncate mt-1">
                      {capitalizeFirst(agent.subject)}
                    </p>
                  )}
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="h-8 w-8 p-0 text-fgMuted hover:bg-bgMuted opacity-0 group-hover:opacity-100 transition-all rounded-lg"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-card border-border/50 rounded-xl">
                  <DropdownMenuItem 
                    onClick={() => handleAgentClick(agent.id)}
                    className="text-fg hover:bg-bgMuted rounded-lg"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Edit Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border/50" />
                  <DropdownMenuItem 
                    onClick={() => handleCopyShareableLink(agent.id)}
                    className="text-fg hover:bg-bgMuted rounded-lg"
                  >
                    <Link className="mr-2 h-4 w-4" />
                    Shareable Link
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Only show custom description if it exists and is not the default fallback */}
              {agent.description && 
               agent.description !== "A helpful AI thinking partner designed to support your child's learning and exploration" && (
                <p className="text-fgMuted text-sm leading-relaxed line-clamp-2 min-h-[2.5rem]">
                  {agent.description}
                </p>
              )}

              {/* Usage Summary */}
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200/50">
                <div className="flex items-center gap-2 mb-1">
                  <MessageSquare className="h-3 w-3 text-blue-600" />
                  <span className="text-xs font-medium text-blue-700">Usage Summary</span>
                </div>
                <p className="text-xs text-blue-700/80 leading-relaxed">
                  {formatUsageStats(agent.interactions || 0, agent.studentsSaved || 0)}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Clock className="h-3 w-3 text-blue-600/60" />
                  <span className="text-xs text-blue-600/60">
                    {getLastActivityText(agent.createdAt, agent.updatedAt)}
                  </span>
                </div>
              </div>
              
              <Button 
                onClick={() => handleStartChat(agent.id)}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground group-hover:shadow-md transition-all rounded-xl font-medium"
                size="lg"
              >
                <Play className="mr-2 h-4 w-4" />
                Let's Talk
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ThinkingPartnersDashboard;
