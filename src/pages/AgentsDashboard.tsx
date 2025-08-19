
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAgents } from "@/hooks/useAgents";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Search, 
  Filter, 
  MoreVertical, 
  Bot, 
  Users, 
  TrendingUp, 
  Settings,
  Share2,
  Eye,
  ExternalLink
} from "lucide-react";
import { AgentType } from "@/types/agent";
import { ShareButton } from "@/components/ShareButton";

const AgentsDashboard = () => {
  const navigate = useNavigate();
  const { agents, isLoading, error } = useAgents();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredAgents = agents?.filter((agent) => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agent.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || agent.status === filterStatus;
    return matchesSearch && matchesFilter;
  }) || [];

  const handleCreateAgent = () => {
    navigate("/agents/create");
  };

  const handleAgentClick = (agentId: string) => {
    navigate(`/agents/${agentId}`);
  };

  const handleViewPublic = (agentId: string) => {
    window.open(`/tutors/${agentId}`, '_blank');
  };

  const handleChatDemo = (agentId: string) => {
    window.open(`/tutors/${agentId}/chat`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <Bot className="h-12 w-12 text-red-500" />
              <div>
                <h3 className="font-semibold text-gray-900">Failed to load tutors</h3>
                <p className="text-sm text-gray-600 mt-1">
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
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">My Tutors</h2>
          <p className="text-gray-600">
            Create and manage your AI tutoring assistants
          </p>
        </div>
        <Button 
          onClick={handleCreateAgent}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Tutor
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search tutors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-white border-gray-200">
            <DropdownMenuItem 
              onClick={() => setFilterStatus("all")}
              className="text-gray-700 hover:bg-gray-50"
            >
              All Status
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setFilterStatus("active")}
              className="text-gray-700 hover:bg-gray-50"
            >
              Active
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setFilterStatus("draft")}
              className="text-gray-700 hover:bg-gray-50"
            >
              Draft
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Tutors Grid */}
      {filteredAgents.length === 0 ? (
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <Bot className="h-12 w-12 text-gray-400" />
              <div>
                <h3 className="font-semibold text-gray-900">No tutors found</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {searchQuery ? "Try adjusting your search criteria" : "Create your first AI tutor to get started"}
                </p>
              </div>
              {!searchQuery && (
                <Button onClick={handleCreateAgent} className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Tutor
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAgents.map((agent: AgentType) => (
            <Card 
              key={agent.id} 
              className="border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleAgentClick(agent.id)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10 border border-gray-200">
                    <AvatarImage src={agent.avatar} alt={agent.name} />
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      <Bot className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg text-gray-900">{agent.name}</CardTitle>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="h-8 w-8 p-0 text-gray-600 hover:bg-gray-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white border-gray-200">
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAgentClick(agent.id);
                      }}
                      className="text-gray-700 hover:bg-gray-50"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Edit Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-200" />
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewPublic(agent.id);
                      }}
                      className="text-gray-700 hover:bg-gray-50"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Public Page
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleChatDemo(agent.id);
                      }}
                      className="text-gray-700 hover:bg-gray-50"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Try Chat Demo
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={agent.status === 'active' ? 'default' : 'secondary'}
                      className={agent.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-200'}
                    >
                      {agent.status}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      {agent.type} • {agent.subject || 'General'}
                    </span>
                  </div>
                  
                  <CardDescription className="text-gray-600 text-sm line-clamp-2">
                    {agent.description || "A helpful AI tutor designed to support student learning"}
                  </CardDescription>
                  
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Users className="mr-1 h-3 w-3" />
                        {agent.interactions || 0}
                      </div>
                      <div className="flex items-center">
                        <TrendingUp className="mr-1 h-3 w-3" />
                        {agent.performance || 0}%
                      </div>
                    </div>
                    
                    <ShareButton 
                      tutorId={agent.id} 
                      tutorName={agent.name}
                      className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AgentsDashboard;
