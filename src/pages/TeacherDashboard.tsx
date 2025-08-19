
import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Users, MessageSquare, TrendingUp, BookOpen, Brain, GraduationCap, Target, Play, Settings } from "lucide-react";
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
          <p className="text-gray-600 font-light">Loading your thinking partners...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center bg-white p-12 rounded-3xl border border-gray-100 shadow-lg">
          <p className="text-red-600 mb-6 font-medium">{error}</p>
          <Button onClick={() => window.location.reload()} className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-8">
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
        return 'bg-green-50 text-green-700 border-green-200';
      case 'inactive':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'draft':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
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
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-light text-gray-900 tracking-tight">
          Your Child's Learning Journey
        </h1>
        <p className="text-xl text-gray-600 font-light max-w-3xl mx-auto leading-relaxed">
          AI thinking partners that adapt to your child's curiosity and help them explore ideas at their own pace.
        </p>
      </div>

      {/* Compact Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
        <Card className="border-gray-100 bg-white shadow-md hover:shadow-lg transition-shadow duration-200 rounded-2xl">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Brain className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-2xl font-light text-gray-900 mb-1">
              {agents.filter(a => a.status === 'active').length}
            </div>
            <p className="text-sm text-gray-600">Active Partners</p>
          </CardContent>
        </Card>
        
        <Card className="border-gray-100 bg-white shadow-md hover:shadow-lg transition-shadow duration-200 rounded-2xl">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-2xl font-light text-gray-900 mb-1">{totalChildrenHelped}</div>
            <p className="text-sm text-gray-600">Children Helped</p>
          </CardContent>
        </Card>
        
        <Card className="border-gray-100 bg-white shadow-md hover:shadow-lg transition-shadow duration-200 rounded-2xl">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-2xl font-light text-gray-900 mb-1">{totalInteractions.toLocaleString()}</div>
            <p className="text-sm text-gray-600">Interactions</p>
          </CardContent>
        </Card>
        
        <Card className="border-gray-100 bg-white shadow-md hover:shadow-lg transition-shadow duration-200 rounded-2xl">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div className="text-2xl font-light text-gray-900 mb-1">{avgHelpfulness.toFixed(1)}/10</div>
            <p className="text-sm text-gray-600">Avg Rating</p>
          </CardContent>
        </Card>
      </div>

      {/* Thinking Partners Section */}
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-light text-gray-900 mb-4">Your Child's AI Thinking Partners</h2>
          <p className="text-lg text-gray-600 font-light">
            Manage and monitor your child's personalized learning assistants
          </p>
        </div>

        {agents.length === 0 ? (
          <Card className="text-center py-20 border-gray-100 bg-white shadow-lg rounded-3xl max-w-2xl mx-auto">
            <CardContent>
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
                <GraduationCap className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-light text-gray-900 mb-4">Create Your First AI Thinking Partner</h3>
              <p className="text-lg text-gray-600 font-light mb-8 max-w-md mx-auto leading-relaxed">
                Get started by creating a personalized AI thinking partner tailored to your child's learning needs.
              </p>
              <Link to="/agents/create">
                <Button className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-full font-medium shadow-xl hover:shadow-2xl transition-all duration-300">
                  <Plus className="h-5 w-5 mr-2" />
                  Create Your First Thinking Partner
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Create New Thinking Partner Card */}
            <Link to="/agents/create">
              <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-dashed border-blue-200 hover:border-blue-300 bg-blue-50/30 hover:bg-blue-50/50 h-full min-h-[300px] rounded-2xl">
                <CardContent className="flex flex-col items-center justify-center h-full py-12">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-6">
                    <Plus className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2 text-lg">Create New Thinking Partner</h3>
                  <p className="text-gray-600 text-center font-light">
                    Add a new AI thinking partner to help your child
                  </p>
                </CardContent>
              </Card>
            </Link>

            {/* Existing Tutors */}
            {agents.map((agent: AgentType) => (
              <Card key={agent.id} className="hover:shadow-xl transition-all duration-300 cursor-pointer border-gray-100 hover:border-blue-200 bg-white h-full min-h-[300px] rounded-2xl overflow-hidden group">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12 border-2 border-gray-100">
                        <AvatarImage src={agent.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${agent.id}`} alt={agent.name} />
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {getSubjectIcon(agent.type)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-lg font-medium text-gray-900 truncate">{agent.name}</CardTitle>
                        <CardDescription className="text-gray-600 truncate font-light">
                          {agent.type}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <ShareButton 
                        tutorId={agent.id} 
                        tutorName={agent.name}
                        className="h-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                      <Badge className={`${getStatusColor(agent.status)} text-xs font-medium border rounded-full px-3 py-1`}>
                        {agent.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-6">
                  <p className="text-gray-700 font-light leading-relaxed line-clamp-2">
                    {agent.description || agent.purpose || "A helpful AI thinking partner for your child"}
                  </p>
                  
                  {agent.learningObjective && (
                    <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700">Learning Goal</span>
                      </div>
                      <p className="text-sm text-green-700 font-light">
                        {truncateLearningObjective(agent.learningObjective)}
                      </p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center p-3 bg-gray-50 rounded-xl">
                      <p className="font-medium text-gray-900">{agent.studentsSaved || 0}</p>
                      <p className="text-gray-500 text-xs">Children</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-xl">
                      <p className="font-medium text-gray-900">{agent.interactions || 0}</p>
                      <p className="text-gray-500 text-xs">Interactions</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Button 
                      onClick={() => window.open(`/tutors/${agent.id}/chat`, '_blank')}
                      className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-lg"
                      size="lg"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Start Learning Session
                    </Button>
                    
                    <Link to={`/agents/${agent.id}`} className="block">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="w-full text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Customize Partner
                      </Button>
                    </Link>
                  </div>
                  
                  {agent.helpfulnessScore && (
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className="text-sm text-gray-500 font-light">Rating</span>
                      <span className="text-sm font-medium text-gray-900">{agent.helpfulnessScore}/10</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentDashboard;
