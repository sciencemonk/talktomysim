import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Users, MessageSquare, TrendingUp, BookOpen, Brain, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAgents } from "@/hooks/useAgents";
import { AgentType } from "@/types/agent";
import { ShareButton } from "@/components/ShareButton";

const TeacherDashboard = () => {
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
          <p className="text-gray-600 dark:text-gray-400">Loading your tutors...</p>
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

  const totalStudentsHelped = agents.reduce((sum, agent) => sum + (agent.studentsSaved || 0), 0);
  const totalInteractions = agents.reduce((sum, agent) => sum + (agent.interactions || 0), 0);
  const avgHelpfulness = agents.length > 0 ? agents.reduce((sum, agent) => sum + (agent.helpfulnessScore || 0), 0) / agents.length : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Active Tutors</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Brain className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">
              {agents.filter(a => a.status === 'active').length}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Ready to help students
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Students Helped</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">{totalStudentsHelped}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Across all tutors
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Interactions</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">{totalInteractions.toLocaleString()}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Questions answered
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Helpfulness Score</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">{avgHelpfulness.toFixed(1)}/10</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Average rating
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tutors Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your AI Tutors</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              Manage and monitor your personalized teaching assistants
            </p>
          </div>
        </div>

        {agents.length === 0 ? (
          <Card className="text-center py-16 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <CardContent>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <GraduationCap className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Create Your First AI Tutor</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
                Get started by creating a personalized AI tutor tailored to your students' needs and your teaching style.
              </p>
              <Link to="/create-tutor">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Tutor
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Create New Tutor Card */}
            <Link to="/create-tutor">
              <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer border-2 border-dashed border-blue-200 hover:border-blue-300 dark:border-blue-800 dark:hover:border-blue-700 bg-blue-50/30 hover:bg-blue-50/50 dark:bg-blue-950/20 dark:hover:bg-blue-950/30 h-full">
                <CardContent className="flex flex-col items-center justify-center h-full py-12">
                  <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                    <Plus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Create New Tutor</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center leading-relaxed">
                    Add a new AI tutor to help your students learn
                  </p>
                </CardContent>
              </Card>
            </Link>

            {/* Existing Tutors */}
            {agents.map((agent: AgentType) => (
              <Link key={agent.id} to={`/agents/${agent.id}`}>
                <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 bg-white dark:bg-gray-800 h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10 border-2 border-gray-100 dark:border-gray-700">
                          <AvatarImage src={agent.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${agent.id}`} alt={agent.name} />
                          <AvatarFallback className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                            {getSubjectIcon(agent.type)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">{agent.name}</CardTitle>
                          <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                            {agent.type}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
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
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-2 leading-relaxed">
                      {agent.description || agent.purpose || "A helpful AI tutor for students"}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{agent.studentsSaved || 0}</p>
                        <p className="text-gray-500 dark:text-gray-400">Students Helped</p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{agent.interactions || 0}</p>
                        <p className="text-gray-500 dark:text-gray-400">Interactions</p>
                      </div>
                    </div>
                    
                    {agent.helpfulnessScore && (
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Helpfulness Score</span>
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

export default TeacherDashboard;
