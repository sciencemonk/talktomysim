import { useParams, useNavigate } from "react-router-dom";
import { usePublicAgent } from "@/hooks/usePublicAgent";
import AdvisorSearchModal from "@/components/AdvisorSearchModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, MessageSquare, Star, Users, Clock, Zap } from "lucide-react";

const PublicAgentDetails = () => {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const { agent, isLoading, error } = usePublicAgent(agentId || "");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-pulse">Loading agent details...</div>
        </div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Error</h2>
          <p className="text-muted-foreground">Failed to load agent details.</p>
          <Button onClick={() => navigate(-1)} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-12">
        <Button onClick={() => navigate(-1)} variant="ghost" className="mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Card className="max-w-4xl mx-auto">
          <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-2 md:space-y-0">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={agent.avatar} alt={agent.name} />
                <AvatarFallback>
                  {agent.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div>
                  <CardTitle className="text-lg font-semibold">{agent.name}</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {agent.type}
                  </CardDescription>
                </div>
              </div>
            </div>
            <div className="space-x-2">
              <Button>
                <MessageSquare className="h-4 w-4 mr-2" />
                Start Chat
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">About</h3>
              <p className="text-muted-foreground">{agent.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="shadow-none border">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary">{agent.type}</Badge>
                </CardContent>
              </Card>

              <Card className="shadow-none border">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Subject</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  {agent.subject || "General"}
                </CardContent>
              </Card>

              <Card className="shadow-none border">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Grade Level</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  {agent.gradeLevel || "All"}
                </CardContent>
              </Card>

              <Card className="shadow-none border">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Teaching Style</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  {agent.teachingStyle || "Adaptable"}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Stats</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="shadow-none border">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">
                      Helpfulness Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>{agent.helpfulnessScore || "N/A"}</span>
                  </CardContent>
                </Card>

                <Card className="shadow-none border">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">
                      Interactions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span>{agent.interactions || 0}</span>
                  </CardContent>
                </Card>

                <Card className="shadow-none border">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">
                      Response Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-green-500" />
                    <span>{agent.performance || "N/A"}</span>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PublicAgentDetails;
