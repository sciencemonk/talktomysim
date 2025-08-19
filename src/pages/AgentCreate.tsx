
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import AgentConfigSettings from "@/components/AgentConfigSettings";
import { createAgent } from "@/services/agentService";
import { AgentType } from "@/types/agent";
import { useAuth } from "@/hooks/useAuth";

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

const ThinkingPartnerCreate = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Create a temporary agent object for the configuration
  const [tempAgent, setTempAgent] = useState<AgentType>({
    id: "temp-new-agent",
    name: "New Thinking Partner",
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
    const gradeName = GRADE_LEVELS.find(g => g.id === agent.gradeLevel)?.name || 'children';
    
    return `You are ${agent.name}, a friendly and knowledgeable thinking partner specializing in ${subjectName} for ${gradeName}.

Your main goals are to:
- Help children understand concepts clearly through conversation
- Ask thoughtful questions that promote critical thinking
- Provide step-by-step explanations when needed
- Encourage children when they struggle
- Make learning engaging and fun through discussion
- Guide children to discover answers rather than just giving them

${agent.learningObjective ? `Learning Objective: ${agent.learningObjective}

Focus on helping children achieve this specific learning objective through thoughtful conversation and guided discovery.` : ''}

Always be patient, supportive, and adapt to each child's learning pace and style. If a child seems confused, ask simpler questions to help them build understanding step by step. Celebrate their thinking process and effort, not just correct answers!`;
  };
  
  const handleCreateAgent = async () => {
    // Check authentication first
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create a thinking partner.",
        variant: "destructive",
      });
      return;
    }

    if (!tempAgent.name || tempAgent.name === "New Thinking Partner") {
      toast({
        title: "Missing Information",
        description: "Please provide a name for your thinking partner.",
        variant: "destructive",
      });
      return;
    }
    
    if (!tempAgent.subject) {
      toast({
        title: "Missing Information", 
        description: "Please select a subject for your thinking partner.",
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
            details: "Available for child chat"
          }
        }
      });
      
      // Check if creation was successful
      if (!createdAgent) {
        throw new Error("Failed to create thinking partner. Please try again.");
      }
      
      toast({
        title: "Thinking Partner Created!",
        description: `${createdAgent.name} has been successfully created with auto-generated teaching instructions.`,
      });
      
      // Navigate to the dashboard instead of the tutor detail page
      navigate("/dashboard");
    } catch (error) {
      console.error("Error creating thinking partner:", error);
      toast({
        title: "Creation Failed",
        description: error instanceof Error ? error.message : "There was an error creating your thinking partner. Please try again.",
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
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-fg mb-2 sm:mb-3 px-2">Create Your Child's AI Thinking Partner</h1>
          <p className="text-base sm:text-lg text-fgMuted max-w-2xl mx-auto px-4">
            Set up a personalized AI thinking partner that adapts to your child's learning style and helps them explore ideas effectively
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
                Teaching instructions will be automatically generated based on your thinking partner's configuration
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
                    <span className="hidden xs:inline">Creating Thinking Partner...</span>
                    <span className="xs:hidden">Creating...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="hidden xs:inline">Create Thinking Partner</span>
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

export default ThinkingPartnerCreate;
