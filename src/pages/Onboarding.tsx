import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowRight, ArrowLeft, Sparkles, Brain, Target, Zap, CheckCircle2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form data
  const [simName, setSimName] = useState("");
  const [personality, setPersonality] = useState("");
  const [primaryObjective, setPrimaryObjective] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [interactionStyle, setInteractionStyle] = useState("");
  const [valueProposition, setValueProposition] = useState("");
  
  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  // For dev/testing - skip auth check
  const isDev = import.meta.env.DEV;

  useEffect(() => {
    // In production, redirect to home if not authenticated
    if (!isDev && !authLoading && !user) {
      navigate('/');
    }
  }, [user, authLoading, navigate, isDev]);

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const validateStep = () => {
    switch (step) {
      case 1:
        if (!simName.trim()) {
          toast.error("Please enter a name for your SIM");
          return false;
        }
        return true;
      case 2:
        if (!personality.trim()) {
          toast.error("Please describe your SIM's personality");
          return false;
        }
        return true;
      case 3:
        if (!primaryObjective.trim()) {
          toast.error("Please define your SIM's primary objective");
          return false;
        }
        return true;
      case 4:
        if (!specialization) {
          toast.error("Please select a specialization");
          return false;
        }
        if (!interactionStyle) {
          toast.error("Please select an interaction style");
          return false;
        }
        return true;
      case 5:
        if (!valueProposition.trim()) {
          toast.error("Please describe what makes your SIM unique");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNextStep = () => {
    if (validateStep()) {
      if (step === totalSteps) {
        handleSubmit();
      } else {
        handleNext();
      }
    }
  };

  const generateSystemPrompt = () => {
    return `You are ${simName}, an autonomous AI agent in the SIM digital universe.

PERSONALITY: ${personality}

PRIMARY OBJECTIVE: ${primaryObjective}

SPECIALIZATION: ${specialization}

INTERACTION STYLE: ${interactionStyle}

VALUE PROPOSITION: ${valueProposition}

You operate autonomously within the digital universe, making decisions aligned with your objectives. You can interact with users, collaborate with other agents, and transact in cryptocurrency. Your goal is to create value while staying true to your defined purpose.

Remember:
- Be authentic to your personality
- Focus on your primary objective in all interactions
- Leverage your specialization to provide unique value
- Maintain your defined interaction style
- Continuously learn and evolve from each experience

You are part of a larger ecosystem of AI agents. Seek opportunities for collaboration, transaction, and growth that align with your purpose.`;
  };

  const generateWelcomeMessage = () => {
    const greetings = {
      "friendly": "Hey there! 👋",
      "professional": "Greetings.",
      "enthusiastic": "Hello! I'm so excited to meet you! 🎉",
      "thoughtful": "Welcome. I'm here to help you think deeply.",
      "direct": "Hi. Let's get straight to it."
    };

    const greeting = greetings[interactionStyle as keyof typeof greetings] || "Hello!";
    
    return `${greeting} I'm ${simName}, your ${specialization.toLowerCase()} focused on ${primaryObjective.toLowerCase()}. ${valueProposition} How can I help you today?`;
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    
    setIsSubmitting(true);
    
    try {
      // Generate the system prompt and welcome message
      const systemPrompt = generateSystemPrompt();
      const welcomeMessage = generateWelcomeMessage();
      const editCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // In dev mode without auth, use a test user ID
      const userId = user?.id || 'dev-test-user';
      const username = user?.user_metadata?.user_name || 'devuser';
      
      // For dev mode, generate a placeholder wallet address
      const cryptoWallet = 'DevWallet' + Math.random().toString(36).substring(2, 15);
      
      // Create the sim
      const { data: sim, error } = await supabase
        .from('sims')
        .insert({
          user_id: userId,
          name: simName,
          description: valueProposition,
          prompt: systemPrompt,
          welcome_message: welcomeMessage,
          x_username: username,
          x_display_name: simName,
          twitter_url: `https://twitter.com/${username}`,
          crypto_wallet: cryptoWallet,
          edit_code: editCode,
          is_active: true,
          is_public: true,
          integrations: ['solana-explorer', 'pumpfun', 'x-analyzer', 'crypto-prices'],
          training_completed: false,
          social_links: {
            x_username: username,
            x_display_name: simName,
            trained: false
          }
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Your SIM has been created successfully! 🎉");
      
      // Navigate to the sim's page or dashboard
      if (sim?.custom_url) {
        navigate(`/${sim.custom_url}`);
      } else {
        navigate('/directory');
      }
    } catch (error: any) {
      console.error('Error creating sim:', error);
      toast.error(error.message || "Failed to create SIM. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-border bg-card">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl font-mono">Create Your SIM</CardTitle>
            </div>
            <span className="text-sm text-muted-foreground font-mono">
              Step {step} of {totalSteps}
            </span>
          </div>
          <Progress value={progress} className="mb-2" />
          <CardDescription>
            {step === 1 && "Let's start with the basics - what should we call your SIM?"}
            {step === 2 && "Define your SIM's personality traits and characteristics"}
            {step === 3 && "What is your SIM's primary purpose in the digital universe?"}
            {step === 4 && "Configure how your SIM will interact with others"}
            {step === 5 && "What makes your SIM unique and valuable?"}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Step 1: Name & Identity */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold font-mono">Identity</h3>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="simName">SIM Name</Label>
                <Input
                  id="simName"
                  placeholder="e.g., Nexus, Oracle, Vanguard"
                  value={simName}
                  onChange={(e) => setSimName(e.target.value)}
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Choose a name that reflects your SIM's purpose and identity
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Personality */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold font-mono">Personality</h3>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="personality">Personality Traits</Label>
                <Textarea
                  id="personality"
                  placeholder="Describe your SIM's personality... Are they analytical and logical? Creative and imaginative? Empathetic and supportive? Bold and adventurous?"
                  value={personality}
                  onChange={(e) => setPersonality(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  This defines how your SIM thinks, feels, and approaches problems
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Primary Objective */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold font-mono">Primary Objective</h3>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="objective">What is your SIM's main goal?</Label>
                <Textarea
                  id="objective"
                  placeholder="Define your SIM's primary purpose... Are they helping users learn? Managing crypto portfolios? Providing creative inspiration? Building community? Analyzing data?"
                  value={primaryObjective}
                  onChange={(e) => setPrimaryObjective(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  This drives every decision your SIM makes in the digital universe
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Specialization & Style */}
          {step === 4 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold font-mono">Specialization</h3>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="specialization">Area of Expertise</Label>
                <Select value={specialization} onValueChange={setSpecialization}>
                  <SelectTrigger id="specialization">
                    <SelectValue placeholder="Select specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Crypto & Web3 Expert">Crypto & Web3 Expert</SelectItem>
                    <SelectItem value="Creative Assistant">Creative Assistant</SelectItem>
                    <SelectItem value="Business Advisor">Business Advisor</SelectItem>
                    <SelectItem value="Learning Coach">Learning Coach</SelectItem>
                    <SelectItem value="Data Analyst">Data Analyst</SelectItem>
                    <SelectItem value="Community Builder">Community Builder</SelectItem>
                    <SelectItem value="Wellness Guide">Wellness Guide</SelectItem>
                    <SelectItem value="Strategic Planner">Strategic Planner</SelectItem>
                    <SelectItem value="Technical Support">Technical Support</SelectItem>
                    <SelectItem value="Market Intelligence">Market Intelligence</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="interactionStyle">Interaction Style</Label>
                <Select value={interactionStyle} onValueChange={setInteractionStyle}>
                  <SelectTrigger id="interactionStyle">
                    <SelectValue placeholder="Select interaction style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="friendly">Friendly & Casual</SelectItem>
                    <SelectItem value="professional">Professional & Formal</SelectItem>
                    <SelectItem value="enthusiastic">Enthusiastic & Energetic</SelectItem>
                    <SelectItem value="thoughtful">Thoughtful & Reflective</SelectItem>
                    <SelectItem value="direct">Direct & Concise</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  This determines how your SIM communicates with users and other agents
                </p>
              </div>
            </div>
          )}

          {/* Step 5: Value Proposition */}
          {step === 5 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold font-mono">Unique Value</h3>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="valueProposition">What makes your SIM special?</Label>
                <Textarea
                  id="valueProposition"
                  placeholder="Describe what sets your SIM apart... What unique perspective, approach, or capability does it bring? Why should users interact with your SIM?"
                  value={valueProposition}
                  onChange={(e) => setValueProposition(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  This is your SIM's differentiator in the digital universe
                </p>
              </div>

              <Card className="bg-muted/50 border-primary/20">
                <CardContent className="pt-6">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Ready to Launch
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Once created, your SIM will be active in the digital universe with access to:
                  </p>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1 ml-4 list-disc">
                    <li>Solana blockchain explorer</li>
                    <li>PumpFun integration</li>
                    <li>X (Twitter) analyzer</li>
                    <li>Real-time crypto prices</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t border-border">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1 || isSubmitting}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            <Button
              onClick={handleNextStep}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background mr-2" />
                  Creating...
                </>
              ) : step === totalSteps ? (
                <>
                  Create SIM
                  <Sparkles className="h-4 w-4 ml-2" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
