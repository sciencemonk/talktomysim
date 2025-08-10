
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Bot, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import AgentConfigSettings from "@/components/AgentConfigSettings";
import { ThemeToggle } from "@/components/ThemeToggle";

const AgentCreate = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agentConfig, setAgentConfig] = useState({
    id: "new-tutor",
    name: "New Tutor",
    description: "A helpful AI tutor ready to assist students with their learning.",
    type: "General Tutor",
    status: "inactive" as const,
    createdAt: new Date().toISOString().split('T')[0],
    interactions: 0,
    isPersonal: true,
    model: "GPT-4",
    channels: ["chat"] as string[],
    channelConfigs: {
      chat: {
        enabled: true,
        details: "Available for student chat"
      }
    },
    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=new-tutor`,
    purpose: "Help students learn and understand concepts clearly.",
    prompt: "You are a friendly and knowledgeable AI tutor. Your job is to help students learn by explaining concepts clearly, asking questions to check understanding, and providing encouragement. Always be patient, supportive, and adapt to each student's learning pace.",
    subject: "",
    gradeLevel: "",
    teachingStyle: "",
    customSubject: "",
    voice: "9BWtsMINqrJLrRacOk9x",
    voiceProvider: "Eleven Labs",
    studentsSaved: 0,
    helpfulnessScore: 0
  });
  
  const handleAgentUpdate = (updatedAgent: any) => {
    setAgentConfig(updatedAgent);
  };
  
  const handleCreateAgent = () => {
    setIsSubmitting(true);
    
    // Validate required fields
    if (!agentConfig.name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a name for your tutor.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }
    
    setTimeout(() => {
      toast({
        title: "Tutor Created!",
        description: `${agentConfig.name} has been successfully created.`,
      });
      setIsSubmitting(false);
      navigate("/agents");
    }, 1500);
  };
  
  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <Link to="/agents" className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tutors
        </Link>
        <ThemeToggle />
      </div>
      
      <div className="flex items-center space-x-3 mb-6">
        <Bot className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Create New Tutor</h1>
          <p className="text-muted-foreground mt-1">Configure your AI tutor's personality, subject expertise, and teaching style</p>
        </div>
      </div>
      
      <div className="space-y-6">
        <AgentConfigSettings 
          agent={agentConfig} 
          onAgentUpdate={handleAgentUpdate}
          showSuccessToast={(title, description) => {
            // Don't show auto-save messages during creation
          }}
        />
        
        <Card>
          <CardFooter className="flex justify-end pt-6">
            <Button 
              onClick={handleCreateAgent} 
              disabled={isSubmitting}
              className="gap-2"
              variant="contrast"
              size="lg"
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
    </div>
  );
};

export default AgentCreate;
