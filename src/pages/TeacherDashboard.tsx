
import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Users, MessageSquare, TrendingUp, BookOpen, Brain, GraduationCap, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAgents } from "@/hooks/useAgents";
import { AgentType } from "@/types/agent";
import { ShareButton } from "@/components/ShareButton";

const ParentDashboard = () => {
  const [filter, setFilter] = useState("all-agents");
  const {
    agents,
    isLoading,
    error
  } = useAgents(filter);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your thinking partners...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-red-600 dark:text-red-400 mb-4 font-medium">{error}</p>
          <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const getSubjectIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'math tutor':
        return <Brain className="h-4 w-4" />;
      case 'science tutor':
        return <BookOpen className="h-4 w-4" />;
      case 'reading assistant':
        return <BookOpen className="h-4 w-4" />;
      default:
        return <GraduationCap className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
      case 'inactive':
        return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800';
      case 'draft':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800';
    }
  };

  const truncateLearningObjective = (text: string) => {
    if (!text) return "";
    const sentences = text.split(/[.!?]+/);
    if (sentences.length <= 2) return text;
    return sentences.slice(0, 2).join('. ') + (sentences[0] && sentences[1] ? '...' : '');
  };

  const totalChildrenHelped = agents.reduce((sum, agent) => sum + (agent.studentsSaved || 0), 0);
  const totalInteractions = agents.reduce((sum, agent) => sum + (agent.interactions || 0), 0);
  const avgHelpfulness = agents.length > 0 ? agents.reduce((sum, agent) => sum + (agent.helpfulnessScore || 0), 0) / agents.length : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Compact Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Brain className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {agents.filter(a => a.status === 'active').length}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Active Partners</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">{totalChildrenHelped}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Children Helped</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">{totalInteractions.toLocaleString()}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Interactions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">{avgHelpfulness.toFixed(1)}/10</div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Avg Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Thinking Partners Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Child's AI Thinking Partners</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Manage and monitor your child's personalized learning assistants
            </p>
          </div>
        </div>

        {agents.length === 0 ? (
          <Card className="text-center py-12 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <CardContent>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <GraduationCap className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Create Your First AI Thinking Partner</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Get started by creating a personalized AI thinking partner tailored to your child's learning needs.
              </p>
              <Link to="/agents/create">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Thinking Partner
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Create New Thinking Partner Card */}
            <Link to="/agents/create">
              <Card className="hover:shadow-md transition-all duration-200 cursor-pointer border-2 border-dashed border-blue-200 hover:border-blue-300 dark:border-blue-800 dark:hover:border-blue-700 bg-blue-50/30 hover:bg-blue-50/50 dark:bg-blue-950/20 dark:hover:bg-blue-950/30 h-full min-h-[200px]">
                <CardContent className="flex flex-col items-center justify-center h-full py-8">
                  <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3">
                    <Plus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">Create New Thinking Partner</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                    Add a new AI thinking partner to help your child
                  </p>
                </CardContent>
              </Card>
            </Link>

            {/* Existing Tutors */}
            {agents.map((agent: AgentType) => (
              <Link key={agent.id} to={`/agents/${agent.id}`}>
                <Card className="hover:shadow-md transition-all duration-200 cursor-pointer border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 bg-white dark:bg-gray-800 h-full min-h-[200px]">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10 border-2 border-gray-100 dark:border-gray-700">
                          <AvatarImage src={agent.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${agent.id}`} alt={agent.name} />
                          <AvatarFallback className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                            {getSubjectIcon(agent.type)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-base font-semibold text-gray-900 dark:text-white truncate">{agent.name}</CardTitle>
                          <CardDescription className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {agent.type}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <ShareButton 
                          tutorId={agent.id} 
                          tutorName={agent.name}
                          className="h-8"
                        />
                        <Badge className={`${getStatusColor(agent.status)} text-xs font-medium border`}>
                          {agent.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
                      {agent.description || agent.purpose || "A helpful AI thinking partner for your child"}
                    </p>
                    
                    {agent.learningObjective && (
                      <div className="mb-3 p-2 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-1 mb-1">
                          <Target className="h-3 w-3 text-green-600 dark:text-green-400" />
                          <span className="text-xs font-medium text-green-700 dark:text-green-300">Learning Goal</span>
                        </div>
                        <p className="text-xs text-green-700 dark:text-green-300">
                          {truncateLearningObjective(agent.learningObjective)}
                        </p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{agent.studentsSaved || 0}</p>
                        <p className="text-gray-500 dark:text-gray-400 text-xs">Children</p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{agent.interactions || 0}</p>
                        <p className="text-gray-500 dark:text-gray-400 text-xs">Interactions</p>
                      </div>
                    </div>
                    
                    {agent.helpfulnessScore && (
                      <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-100 dark:border-gray-700">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Rating</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{agent.helpfulnessScore}/10</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentDashboard;
