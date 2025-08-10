import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Edit, Loader2, BookOpenCheck, BrainCircuit, User2, MessageSquare, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { AgentType } from "@/types/agent";
import { getAgent } from "@/services/agentService";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";

const AgentDetails = () => {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [agent, setAgent] = useState<AgentType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAgent = async () => {
      setIsLoading(true);
      try {
        if (!agentId) throw new Error("Agent ID is missing");
        const data = await getAgent(agentId);
        setAgent(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to load tutor details");
        console.error("Error loading tutor:", err);
        toast({
          title: "Error loading tutor",
          description: err.message || "Failed to load tutor details",
          variant: "destructive",
        });
        navigate("/agents");
      } finally {
        setIsLoading(false);
      }
    };

    loadAgent();
  }, [agentId, navigate, toast]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-4">
        <h2 className="text-lg font-semibold">Tutor Not Found</h2>
        <p className="text-muted-foreground">
          {error || "Could not load tutor details."}
        </p>
        <Button variant="outline" onClick={() => navigate("/agents")}>
          Back to Tutors
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <Link 
          to="/agents" 
          className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tutors
        </Link>
        <ThemeToggle />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">{agent.name}</h1>
          <p className="text-muted-foreground mt-1">
            {agent.type} | Since {new Date(agent.createdAt).toLocaleDateString()}
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate(`/agents/edit/${agent.id}`)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Tutor
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={agent.avatar} alt={agent.name} />
                <AvatarFallback>
                  <User2 className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              About
            </CardTitle>
            <CardDescription>Basic information about this AI tutor</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Email</h3>
              <p className="text-muted-foreground">{agent.email}</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Subject</h3>
              <p className="text-muted-foreground">{agent.subject}</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Grade Level</h3>
              <p className="text-muted-foreground">{agent.gradeLevel}</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Teaching Style</h3>
              <p className="text-muted-foreground">{agent.teachingStyle}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <BookOpenCheck className="h-5 w-5" />
              Teaching Details
            </CardTitle>
            <CardDescription>
              Insights into the tutor's teaching capabilities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Purpose</h3>
              <p className="text-muted-foreground">{agent.purpose}</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">AI Model</h3>
              <p className="text-muted-foreground">{agent.model}</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Voice</h3>
              <p className="text-muted-foreground">{agent.voice} ({agent.voiceProvider})</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <BrainCircuit className="h-5 w-5" />
              Performance
            </CardTitle>
            <CardDescription>Key metrics on tutor performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Students Saved</h3>
              <p className="text-muted-foreground">{agent.studentsSaved}</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Helpfulness Score</h3>
              <p className="text-muted-foreground">{agent.helpfulnessScore}</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Last Active</h3>
              <p className="text-muted-foreground">
                {new Date(agent.lastActive).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Teaching Instructions
          </CardTitle>
          <CardDescription>
            Detailed instructions for how the tutor communicates with students
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Prompt</h3>
            <p className="text-muted-foreground font-mono text-sm whitespace-pre-line">
              {agent.prompt}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentDetails;
