
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import TeacherConfigSettings from "@/components/AgentConfigSettings";
import { AgentType } from "@/types/agent";

const AgentCreate = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Create a mock agent for the configuration form
  const [newAgent, setNewAgent] = useState<AgentType>({
    id: "new-agent",
    name: "New Tutor",
    subject: "",
    gradeLevel: "",
    teachingStyle: "",
    purpose: "",
    prompt: "",
    model: "GPT-4",
    voice: "9BWtsMINqrJLrRacOk9x",
    voiceProvider: "Eleven Labs",
    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=new-agent`,
    type: "General Tutor",
    status: "active",
    email: "newtutor@school.edu",
    studentsSaved: 0,
    helpfulnessScore: 0,
    lastActive: new Date().toISOString(),
    createdAt: new Date().toISOString()
  });
  
  const handleAgentUpdate = (updatedAgent: AgentType) => {
    setNewAgent(updatedAgent);
  };
  
  const handleCreateAgent = () => {
    if (!newAgent.name || newAgent.name === "New Tutor") {
      toast({
        title: "Tutor Name Required",
        description: "Please enter a name for your tutor.",
        variant: "destructive",
      });
      return;
    }
    
    if (!newAgent.subject) {
      toast({
        title: "Subject Required",
        description: "Please select a subject for your tutor.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    setTimeout(() => {
      toast({
        title: "Tutor Created!",
        description: `${newAgent.name} has been successfully created.`,
      });
      setIsSubmitting(false);
      navigate("/agents");
    }, 1500);
  };
  
  const showSuccessToast = (title: string, description: string) => {
    // Don't show auto-save toasts during creation to avoid confusion
  };
  
  return (
    <div className="flex-1 space-y-6 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <Link to="/agents" className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tutors
        </Link>
        <ThemeToggle />
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Create New Tutor</h1>
          <p className="text-muted-foreground mt-1">Configure your AI tutor's settings and teaching style</p>
        </div>
        
        <Button 
          onClick={handleCreateAgent} 
          disabled={isSubmitting}
          className="gap-2"
          variant="default"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Create Tutor
            </>
          )}
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Tutor Configuration</CardTitle>
          <CardDescription>
            Set up your AI tutor's identity, teaching approach, and instructions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TeacherConfigSettings 
            agent={newAgent} 
            onAgentUpdate={handleAgentUpdate}
            showSuccessToast={showSuccessToast}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentCreate;
