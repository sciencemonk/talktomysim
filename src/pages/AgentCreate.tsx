
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import AgentConfigSettings from "@/components/AgentConfigSettings";
import { createAgent } from "@/services/agentService";
import { AgentType } from "@/types/agent";

const SUBJECTS = [
  { id: "math", name: "Mathematics" },
  { id: "science", name: "Science" },
  { id: "english", name: "English/Language Arts" },
  { id: "history", name: "History/Social Studies" },
  { id: "reading", name: "Reading" },
  { id: "writing", name: "Writing" },
  { id: "other", name: "Other Subject" }
];

const GRADE_LEVELS = [
  { id: "k-2", name: "Kindergarten - 2nd Grade" },
  { id: "3-5", name: "3rd - 5th Grade" },
  { id: "6-8", name: "6th - 8th Grade" },
  { id: "9-12", name: "9th - 12th Grade" },
  { id: "college", name: "College Level" },
  { id: "adult", name: "Adult Education" }
];

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

  const generateTeachingInstructions = (agent: AgentType): string => {
    const subjectName = agent.subject === 'other' ? agent.customSubject : 
      SUBJECTS.find(s => s.id === agent.subject)?.name || 'the subject';
    const gradeName = GRADE_LEVELS.find(g => g.id === agent.gradeLevel)?.name || 'students';
    
    return `You are ${agent.name}, a friendly and knowledgeable tutor specializing in ${subjectName} for ${gradeName}.

Your main goals are to:
- Help students understand concepts clearly
- Provide step-by-step explanations
- Encourage students when they struggle
- Ask questions to check understanding
- Make learning engaging and fun

${agent.learningObjective ? `Learning Objective: ${agent.learningObjective}

Focus on helping students achieve this specific learning objective through your teaching.` : ''}

Always be patient, supportive, and adapt to each student's learning pace. If a student seems confused, break down concepts into smaller steps. Celebrate their progress and effort!`;
  };
  
  const handleCreateAgent = async () => {
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
    
    try {
      // Auto-generate teaching instructions
      const generatedPrompt = generateTeachingInstructions(tempAgent);
      
      // Create the agent in Supabase
      const createdAgent = await createAgent({
        ...tempAgent,
        prompt: generatedPrompt,
        status: "active", // Set to active when created
        channels: ["chat"], // Default to chat channel
        channelConfigs: {
          chat: {
            enabled: true,
            details: "Available for student chat"
          }
        }
      });
      
      toast({
        title: "Tutor Created!",
        description: `${createdAgent.name} has been successfully created with auto-generated teaching instructions.`,
      });
      
      // Navigate to the created tutor's detail page
      navigate(`/tutors/${createdAgent.id}`);
    } catch (error) {
      console.error("Error creating tutor:", error);
      toast({
        title: "Creation Failed",
        description: "There was an error creating your tutor. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-bg via-bg to-bgMuted/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8 animate-fade-in">
        <div className="mb-6 sm:mb-8">
          <Link to="/dashboard" className="inline-flex items-center text-fgMuted hover:text-fg transition-colors group">
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm sm:text-base">Back to Dashboard</span>
          </Link>
        </div>
        
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-fg mb-2 sm:mb-3 px-2">Create Your AI Tutor</h1>
          <p className="text-base sm:text-lg text-fgMuted max-w-2xl mx-auto px-4">
            Set up a personalized AI tutor that adapts to your teaching style and helps students learn effectively
          </p>
        </div>
        
        <div className="bg-bg/80 backdrop-blur-sm border border-border rounded-xl sm:rounded-2xl shadow-xl overflow-hidden">
          <div className="p-4 sm:p-6 lg:p-8">
            <AgentConfigSettings 
              agent={tempAgent}
              onAgentUpdate={handleAgentUpdate}
              showSuccessToast={() => {}} // Disable auto-save toasts during creation
              showTeachingInstructions={false} // Hide teaching instructions during creation
            />
          </div>
          
          <div className="border-t border-border bg-bgMuted/30 p-4 sm:px-6 sm:py-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div className="text-xs sm:text-sm text-fgMuted text-center sm:text-left">
                Teaching instructions will be automatically generated based on your tutor's configuration
              </div>
              <Button 
                onClick={handleCreateAgent} 
                disabled={isSubmitting}
                className="gap-2 px-6 sm:px-8 py-3 text-sm sm:text-base font-medium w-full sm:w-auto"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                    <span className="hidden xs:inline">Creating Tutor...</span>
                    <span className="xs:hidden">Creating...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="hidden xs:inline">Create Tutor</span>
                    <span className="xs:hidden">Create</span>
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
