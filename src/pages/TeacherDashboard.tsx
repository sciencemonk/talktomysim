
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-fgMuted">Loading your thinking partners...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center bg-card p-8 rounded-2xl border border-border">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
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
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <h1 className="text-4xl md:text-5xl font-light text-fg tracking-tight">
          Your Child's Learning Journey
        </h1>
        <p className="text-lg text-fgMuted max-w-2xl mx-auto leading-relaxed">
          AI thinking partners that adapt to your child's curiosity and help them explore ideas at their own pace.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
        <Card className="text-center border-border/50 bg-card/50">
          <CardContent className="p-6">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div className="text-2xl font-light text-fg mb-1">
              {agents.filter(a => a.status === 'active').length}
            </div>
            <p className="text-sm text-fgMuted">Active Partners</p>
          </CardContent>
        </Card>
        
        <Card className="text-center border-border/50 bg-card/50">
          <CardContent className="p-6">
            <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-2xl font-light text-fg mb-1">{totalChildrenHelped}</div>
            <p className="text-sm text-fgMuted">Children Helped</p>
          </CardContent>
        </Card>
        
        <Card className="text-center border-border/50 bg-card/50">
          <CardContent className="p-6">
            <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-2xl font-light text-fg mb-1">{totalInteractions.toLocaleString()}</div>
            <p className="text-sm text-fgMuted">Interactions</p>
          </CardContent>
        </Card>
        
        <Card className="text-center border-border/50 bg-card/50">
          <CardContent className="p-6">
            <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </div>
            <div className="text-2xl font-light text-fg mb-1">{avgHelpfulness.toFixed(1)}/10</div>
            <p className="text-sm text-fgMuted">Avg Rating</p>
          </CardContent>
        </Card>
      </div>

      {/* Thinking Partners Section */}
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-light text-fg">Your Child's AI Thinking Partners</h2>
          <p className="text-fgMuted max-w-xl mx-auto">
            Manage and monitor your child's personalized learning assistants
          </p>
        </div>

        {agents.length === 0 ? (
          <Card className="text-center py-16 border-border/50 bg-card/50 max-w-xl mx-auto">
            <CardContent className="space-y-6">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                <GraduationCap className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-light text-fg">Create Your First AI Thinking Partner</h3>
                <p className="text-fgMuted leading-relaxed">
                  Get started by creating a personalized AI thinking partner tailored to your child's learning needs.
                </p>
              </div>
              <Link to="/agents/create">
                <Button size="lg" className="font-normal">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Thinking Partner
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Create New Thinking Partner Card */}
            <Link to="/agents/create">
              <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer border-2 border-dashed border-border/50 hover:border-primary/30 bg-card/30 hover:bg-card/50 h-full min-h-[320px] flex items-center justify-center">
                <CardContent className="text-center space-y-4 p-8">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
                    <Plus className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium text-fg">Create New Thinking Partner</h3>
                    <p className="text-sm text-fgMuted">
                      Add a new AI thinking partner to help your child
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Existing Tutors */}
            {agents.map((agent: AgentType) => (
              <Card key={agent.id} className="hover:shadow-lg transition-all duration-200 cursor-pointer border-border/50 hover:border-primary/30 bg-card/50 h-full min-h-[320px] group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <Avatar className="h-10 w-10 border border-border/50">
                        <AvatarImage src={agent.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${agent.id}`} alt={agent.name} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getSubjectIcon(agent.type)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-base font-medium text-fg truncate">{agent.name}</CardTitle>
                        <CardDescription className="text-sm text-fgMuted truncate">
                          {agent.type}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <ShareButton 
                        tutorId={agent.id} 
                        tutorName={agent.name}
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                      <Badge className={`${getStatusColor(agent.status)} text-xs border rounded-full px-2 py-0.5`}>
                        {agent.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  <p className="text-sm text-fgMuted leading-relaxed line-clamp-2 min-h-[2.5rem]">
                    {agent.description || agent.purpose || "A helpful AI thinking partner for your child"}
                  </p>
                  
                  {agent.learningObjective && (
                    <div className="p-3 bg-green-50 rounded-xl border border-green-200/50">
                      <div className="flex items-center gap-2 mb-1">
                        <Target className="h-3 w-3 text-green-600" />
                        <span className="text-xs font-medium text-green-700">Learning Goal</span>
                      </div>
                      <p className="text-xs text-green-700/80 leading-relaxed">
                        {truncateLearningObjective(agent.learningObjective)}
                      </p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="text-center p-2 bg-bgMuted rounded-lg">
                      <p className="font-medium text-fg text-sm">{agent.studentsSaved || 0}</p>
                      <p className="text-fgMuted text-xs">Children</p>
                    </div>
                    <div className="text-center p-2 bg-bgMuted rounded-lg">
                      <p className="font-medium text-fg text-sm">{agent.interactions || 0}</p>
                      <p className="text-fgMuted text-xs">Interactions</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Button 
                      onClick={() => window.open(`/tutors/${agent.id}/chat`, '_blank')}
                      className="w-full font-normal"
                      size="sm"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Learning Session
                    </Button>
                    
                    <Link to={`/agents/${agent.id}`} className="block">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="w-full text-fgMuted hover:text-fg hover:bg-bgMuted"
                      >
                        <Settings className="w-3 h-3 mr-2" />
                        Customize Partner
                      </Button>
                    </Link>
                  </div>
                  
                  {agent.helpfulnessScore && (
                    <div className="flex items-center justify-between pt-3 border-t border-border/30">
                      <span className="text-xs text-fgMuted">Rating</span>
                      <span className="text-xs font-medium text-fg">{agent.helpfulnessScore}/10</span>
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
