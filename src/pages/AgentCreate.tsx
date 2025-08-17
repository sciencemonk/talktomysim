
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import AgentConfigSettings from "@/components/AgentConfigSettings";
import { AgentType } from "@/types/agent";

const AgentCreate = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Create a temporary agent object for the configuration
  const [tempAgent, setTempAgent] = useState<AgentType>({
    id: "temp-new-agent",
    name: "New Tutor",
    description: "",
    type: "General Tutor",
    status: "draft",
    createdAt: new Date().toISOString(),
    model: "GPT-4",
    voice: "9BWtsMINqrJLrRacOk9x",
    voiceProvider: "Eleven Labs",
    purpose: "",
    prompt: "",
    subject: "",
    gradeLevel: "",
    teachingStyle: "",
    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=temp-new-agent`
  });
  
  const handleAgentUpdate = (updatedAgent: AgentType) => {
    setTempAgent(updatedAgent);
  };
  
  const handleCreateAgent = () => {
    if (!tempAgent.name || tempAgent.name === "New Tutor") {
      toast({
        title: "Missing Information",
        description: "Please provide a name for your tutor.",
        variant: "destructive",
      });
      return;
    }
    
    if (!tempAgent.subject) {
      toast({
        title: "Missing Information", 
        description: "Please select a subject for your tutor.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    setTimeout(() => {
      toast({
        title: "Tutor Created!",
        description: `${tempAgent.name} has been successfully created.`,
      });
      setIsSubmitting(false);
      navigate("/dashboard");
    }, 1500);
  };
  
  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8">
        <Link to="/dashboard" className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
      </div>
      
      <div className="flex items-center space-x-3 mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Create New Tutor</h1>
          <p className="text-muted-foreground mt-1">Configure your AI tutor's settings and teaching approach</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Tutor Configuration</CardTitle>
          <CardDescription>
            Set up your AI tutor's identity, teaching style, and instructions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AgentConfigSettings 
            agent={tempAgent}
            onAgentUpdate={handleAgentUpdate}
            showSuccessToast={() => {}} // Disable auto-save toasts during creation
          />
        </CardContent>
        <CardFooter className="flex justify-end border-t pt-6">
          <Button 
            onClick={handleCreateAgent} 
            disabled={isSubmitting}
            className="gap-2"
            variant="contrast"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating Tutor...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Create Tutor
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AgentCreate;
