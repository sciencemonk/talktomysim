import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Users, MessageSquare, TrendingUp, BookOpen, Brain, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAgents } from "@/hooks/useAgents";
import { AgentType } from "@/types/agent";
import { UserSettingsDropdown } from "@/components/UserSettingsDropdown";

const TeacherDashboard = () => {
  const [filter, setFilter] = useState("all-agents");
  const {
    agents,
    isLoading,
    error
  } = useAgents(filter);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your tutors...</p>
        </div>
      </div>;
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>;
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
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const totalStudentsHelped = agents.reduce((sum, agent) => sum + (agent.studentsSaved || 0), 0);
  const totalInteractions = agents.reduce((sum, agent) => sum + (agent.interactions || 0), 0);
  const avgHelpfulness = agents.length > 0 ? agents.reduce((sum, agent) => sum + (agent.helpfulnessScore || 0), 0) / agents.length : 0;

  return <div className="space-y-8 animate-fade-in">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tutors</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agents.filter(a => a.status === 'active').length}</div>
            <p className="text-xs text-muted-foreground">
              Ready to help students
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students Helped</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudentsHelped}</div>
            <p className="text-xs text-muted-foreground">
              Across all tutors
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Interactions</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInteractions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Questions answered
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Helpfulness Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgHelpfulness.toFixed(1)}/10</div>
            <p className="text-xs text-muted-foreground">
              Average rating
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tutors Grid */}
      {agents.length === 0 ? <Card className="text-center py-12">
          <CardContent>
            <GraduationCap className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No tutors yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first AI tutor to start helping students learn
            </p>
            <Link to="/create-tutor">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Your First Tutor
              </Button>
            </Link>
          </CardContent>
        </Card> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Create New Tutor Card - Integrated into main grid */}
          <Link to="/create-tutor">
            <Card className="hover:shadow-md transition-all duration-200 cursor-pointer border-dashed border-2 border-primary/30 hover:border-primary/70 bg-transparent hover:bg-secondary/50">
              <CardContent className="flex flex-col items-center justify-center h-full py-12">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">Create New Tutor</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Add a new AI tutor to help your students
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Existing Tutors */}
          {agents.map((agent: AgentType) => <Link key={agent.id} to={`/agents/${agent.id}`}>
              <Card className="hover:shadow-md transition-all duration-200 cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={agent.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${agent.id}`} alt={agent.name} />
                        <AvatarFallback>
                          {getSubjectIcon(agent.type)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{agent.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {agent.type}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={getStatusColor(agent.status)}>
                      {agent.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {agent.description || agent.purpose || "A helpful AI tutor for students"}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-foreground">{agent.studentsSaved || 0}</p>
                      <p className="text-muted-foreground">Students Helped</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{agent.interactions || 0}</p>
                      <p className="text-muted-foreground">Interactions</p>
                    </div>
                  </div>
                  
                  {agent.helpfulnessScore && <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Helpfulness</span>
                      <span className="text-sm font-medium">{agent.helpfulnessScore}/10</span>
                    </div>}
                </CardContent>
              </Card>
            </Link>)}
        </div>}
    </div>;
};

export default TeacherDashboard;
