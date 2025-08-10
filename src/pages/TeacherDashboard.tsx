import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Bot, Users, TrendingUp, Clock, MoreVertical, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAgents } from '@/hooks/useAgents';
import { ThemeToggle } from '@/components/ThemeToggle';

const TeacherDashboard = () => {
  const { agents, isLoading } = useAgents();
  
  const activeAgents = agents.filter(agent => agent.status === 'active');
  const totalStudents = agents.reduce((sum, agent) => sum + (agent.studentsSaved || 0), 0);
  const avgHelpfulness = agents.length > 0 
    ? agents.reduce((sum, agent) => sum + (agent.helpfulnessScore || 0), 0) / agents.length 
    : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My AI Tutors</h1>
          <p className="text-muted-foreground">
            Manage and monitor your AI tutoring assistants
          </p>
        </div>
        <ThemeToggle />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Active Tutors</CardTitle>
            <CardDescription>Tutors currently available to students</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold">{activeAgents.length}</div>
            <p className="text-muted-foreground">
              <TrendingUp className="h-4 w-4 inline-block mr-1" />
              {Math.round((activeAgents.length / agents.length) * 100)}% active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Students Impacted</CardTitle>
            <CardDescription>Total students helped by your tutors</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-muted-foreground">
              <Users className="h-4 w-4 inline-block mr-1" />
              Impacting student learning
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Avg. Helpfulness Score</CardTitle>
            <CardDescription>Average rating from student feedback</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold">{avgHelpfulness.toFixed(1)} / 10</div>
            <p className="text-muted-foreground">
              <TrendingUp className="h-4 w-4 inline-block mr-1" />
              Positive student feedback
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Tutors</CardTitle>
            <CardDescription>All AI tutors in your collection</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold">{agents.length}</div>
            <p className="text-muted-foreground">
              <Bot className="h-4 w-4 inline-block mr-1" />
              AI tutors configured
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Tutor</CardTitle>
          <CardDescription>
            Add a new AI tutor to your collection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Click the button below to start creating a new AI tutor. You can
            customize its name, subject, teaching style, and more.
          </p>
          <Button asChild className="mt-4" variant="outline">
            <Link to="/agents/create" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create New Tutor
            </Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => (
          <Card key={agent.id}>
            <CardHeader className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={agent.avatar} alt={agent.name} />
                <AvatarFallback>
                  <Bot className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="line-clamp-1">{agent.name}</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  {agent.type}
                </CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to={`/agents/${agent.id}`} className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4" />
                      View Details
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled>
                    <Clock className="mr-2 h-4 w-4" />
                    Coming Soon
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {agent.studentsSaved} Students
                </div>
                <Badge variant="secondary">{agent.status}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TeacherDashboard;
