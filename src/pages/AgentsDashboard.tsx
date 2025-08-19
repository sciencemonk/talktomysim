
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAgents } from "@/hooks/useAgents";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  MoreVertical, 
  Bot, 
  Settings,
  Play,
  ExternalLink
} from "lucide-react";
import { AgentType } from "@/types/agent";

const ThinkingPartnersDashboard = () => {
  const navigate = useNavigate();
  const { agents, isLoading, error } = useAgents();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAgents = agents?.filter((agent) => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agent.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  }) || [];

  const handleCreateAgent = () => {
    navigate("/agents/create");
  };

  const handleAgentClick = (agentId: string) => {
    navigate(`/agents/${agentId}`);
  };

  const handleStartChat = (agentId: string) => {
    window.open(`/tutors/${agentId}/chat`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-80" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
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
                <h3 className="font-semibold text-gray-900">Failed to load thinking partners</h3>
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
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Your Child's Thinking Partners</h2>
          <p className="text-gray-600 mt-1">
            AI learning assistants ready to help your child explore ideas and learn
          </p>
        </div>
        <Button 
          onClick={handleCreateAgent}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-md"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Thinking Partner
        </Button>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search thinking partners..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Thinking Partners Grid */}
      {filteredAgents.length === 0 ? (
        <Card className="border-gray-200">
          <CardContent className="pt-12 pb-12">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center">
                <Bot className="h-12 w-12 text-blue-500" />
              </div>
              <div className="max-w-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {searchQuery ? "No thinking partners found" : "Create your first thinking partner"}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery 
                    ? "Try adjusting your search criteria" 
                    : "Set up an AI learning assistant that's perfectly tailored to help your child learn and explore new ideas"
                  }
                </p>
                {!searchQuery && (
                  <Button 
                    onClick={handleCreateAgent} 
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    size="lg"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Create First Thinking Partner
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAgents.map((agent: AgentType) => (
            <Card 
              key={agent.id} 
              className="border-gray-200 hover:shadow-lg transition-all duration-200 group"
            >
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                <div className="flex items-center space-x-3 flex-1">
                  <Avatar className="h-12 w-12 border-2 border-gray-100">
                    <AvatarImage src={agent.avatar} alt={agent.name} />
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      <Bot className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg text-gray-900 truncate">{agent.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant={agent.status === 'active' ? 'default' : 'secondary'}
                        className={agent.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-200'}
                      >
                        {agent.status}
                      </Badge>
                      {agent.subject && (
                        <span className="text-sm text-gray-500 truncate">
                          {agent.subject}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="h-8 w-8 p-0 text-gray-600 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white border-gray-200">
                    <DropdownMenuItem 
                      onClick={() => handleAgentClick(agent.id)}
                      className="text-gray-700 hover:bg-gray-50"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Edit Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-200" />
                    <DropdownMenuItem 
                      onClick={() => window.open(`/tutors/${agent.id}`, '_blank')}
                      className="text-gray-700 hover:bg-gray-50"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Profile
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 text-sm line-clamp-2 min-h-[2.5rem]">
                  {agent.description || "A helpful AI thinking partner designed to support your child's learning and exploration"}
                </p>
                
                <Button 
                  onClick={() => handleStartChat(agent.id)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white group-hover:shadow-md transition-all"
                  size="lg"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Start Learning Session
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThinkingPartnersDashboard;
