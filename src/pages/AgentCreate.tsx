
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    prompt: "",
    subject: "",
    gradeLevel: "",
    learningObjective: "",
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
    <div className="min-h-screen bg-gradient-to-br from-bg via-bg to-bgMuted/30">
      <div className="max-w-4xl mx-auto px-6 py-8 animate-fade-in">
        <div className="mb-8">
          <Link to="/dashboard" className="inline-flex items-center text-fgMuted hover:text-fg transition-colors group">
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </Link>
        </div>
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-fg mb-3">Create Your AI Tutor</h1>
          <p className="text-lg text-fgMuted max-w-2xl mx-auto">
            Set up a personalized AI tutor that adapts to your teaching style and helps students learn effectively
          </p>
        </div>
        
        <div className="bg-bg/80 backdrop-blur-sm border border-border rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8">
            <AgentConfigSettings 
              agent={tempAgent}
              onAgentUpdate={handleAgentUpdate}
              showSuccessToast={() => {}} // Disable auto-save toasts during creation
            />
          </div>
          
          <div className="border-t border-border bg-bgMuted/30 px-8 py-6">
            <div className="flex justify-between items-center">
              <div className="text-sm text-fgMuted">
                Your tutor will be ready to help students immediately after creation
              </div>
              <Button 
                onClick={handleCreateAgent} 
                disabled={isSubmitting}
                className="gap-2 px-8 py-3 text-base font-medium"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creating Tutor...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-5 w-5" />
                    Create Tutor
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentCreate;
