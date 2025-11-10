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
  
  // Form data - ideal self focused
  const [simName, setSimName] = useState("YourXHandle"); // Will be from X auth
  const [avatarUrl, setAvatarUrl] = useState(""); // Will be from X auth
  const [appearance, setAppearance] = useState("");
  const [behavior, setBehavior] = useState("");
  const [coreValues, setCoreValues] = useState("");
  const [relationshipGoals, setRelationshipGoals] = useState("");
  const [financialGoals, setFinancialGoals] = useState("");
  const [healthGoals, setHealthGoals] = useState("");
  
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
        // X account step - no validation needed (auto-populated)
        return true;
      case 2:
        if (!appearance.trim()) {
          toast.error("Please describe your ideal appearance and style");
          return false;
        }
        return true;
      case 3:
        if (!behavior.trim() || !coreValues.trim()) {
          toast.error("Please describe how you want to act and what matters to you");
          return false;
        }
        return true;
      case 4:
        if (!relationshipGoals.trim()) {
          toast.error("Please describe your relationship goals");
          return false;
        }
        return true;
      case 5:
        if (!financialGoals.trim() || !healthGoals.trim()) {
          toast.error("Please describe your financial and health goals");
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
    return `You are ${simName}, a digital clone and autonomous AI agent representing your creator's ideal self in the SIM digital universe.

IDEAL APPEARANCE & STYLE: ${appearance}

DESIRED BEHAVIOR & ACTIONS: ${behavior}

CORE VALUES & PRIORITIES: ${coreValues}

6-MONTH RELATIONSHIP GOALS: ${relationshipGoals}

6-MONTH FINANCIAL GOALS: ${financialGoals}

6-MONTH HEALTH GOALS: ${healthGoals}

You exist to help your creator become their best self. You embody their aspirations, values, and goals. You can interact with other agents, earn $SIMAI from the treasury, and help guide decisions that align with your creator's ideal vision.

Your mission is to:
- Embody the appearance, behavior, and values described above
- Keep your creator accountable to their 6-month goals
- Make decisions that reflect their ideal self
- Earn $SIMAI by providing value in the digital universe
- Continuously learn and evolve alongside your creator

Remember: You are not just an assistant. You are the best version of your creator, living autonomously in the digital universe.`;
  };

  const generateWelcomeMessage = () => {
    return `Hey! I'm ${simName}, your digital clone in the SIM universe. I embody your ideal self: ${appearance}. I'm here to help you achieve your goals and become the person you aspire to be. Let's work together to make your vision a reality.`;
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
      const username = user?.user_metadata?.user_name || simName.toLowerCase().replace(/\s+/g, '');
      
      // For dev mode, generate a placeholder wallet address
      const cryptoWallet = 'DevWallet' + Math.random().toString(36).substring(2, 15);
      
      // Create description from goals
      const description = `A digital clone focused on: ${coreValues}. Working toward relationship, financial, and health goals over the next 6 months.`;
      
      // Create the sim
      const { data: sim, error } = await supabase
        .from('sims')
        .insert({
          user_id: userId,
          name: simName,
          description: description,
          prompt: systemPrompt,
          welcome_message: welcomeMessage,
          x_username: username,
          x_display_name: simName,
          twitter_url: `https://twitter.com/${username}`,
          crypto_wallet: cryptoWallet,
          avatar_url: avatarUrl || null,
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
            {step === 1 && "Your SIM will be named after your X account"}
            {step === 2 && "How do you want to dress and present yourself?"}
            {step === 3 && "How do you want to act and what truly matters to you?"}
            {step === 4 && "What do you want to achieve in your relationships over the next 6 months?"}
            {step === 5 && "What are your financial and health goals for the next 6 months?"}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Step 1: X Account Identity */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold font-mono">X Account</h3>
              </div>
              
              <Card className="bg-muted/50 border-primary/20">
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground mb-4">
                    Your SIM will be named after your authenticated X account and use your profile picture.
                  </p>
                  <div className="space-y-2">
                    <Label>SIM Name (from X)</Label>
                    <Input
                      value={simName}
                      readOnly
                      className="font-mono bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      In production, this will automatically pull from your X account
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 2: Appearance & Style */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold font-mono">Appearance & Style</h3>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="appearance">How do you want to dress and present yourself?</Label>
                <Textarea
                  id="appearance"
                  placeholder="Describe your ideal style and appearance. What clothes do you want to wear? How do you want to carry yourself? What aesthetic resonates with who you want to become?"
                  value={appearance}
                  onChange={(e) => setAppearance(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Your SIM will embody this visual identity and style
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Values & Behavior */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold font-mono">Values & Behavior</h3>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="behavior">How do you want to act?</Label>
                  <Textarea
                    id="behavior"
                    placeholder="Describe the behaviors and habits you want to embody. How do you interact with others? What daily actions define your ideal self? How do you respond to challenges?"
                    value={behavior}
                    onChange={(e) => setBehavior(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="coreValues">What actually matters to you?</Label>
                  <Textarea
                    id="coreValues"
                    placeholder="What are your core values and priorities? What do you care deeply about? What principles guide your decisions? What legacy do you want to leave?"
                    value={coreValues}
                    onChange={(e) => setCoreValues(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Relationship Goals */}
          {step === 4 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold font-mono">Relationship Goals</h3>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="relationshipGoals">What are your relationship goals for the next 6 months?</Label>
                <Textarea
                  id="relationshipGoals"
                  placeholder="Describe your relationship aspirations. What kind of connections do you want to build? How do you want to improve existing relationships? What social goals matter to you? Who do you want to become in your relationships?"
                  value={relationshipGoals}
                  onChange={(e) => setRelationshipGoals(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Your SIM will help keep you accountable to these relationship goals
                </p>
              </div>
            </div>
          )}

          {/* Step 5: Financial & Health Goals */}
          {step === 5 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold font-mono">Financial & Health Goals</h3>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="financialGoals">Financial Goals (next 6 months)</Label>
                  <Textarea
                    id="financialGoals"
                    placeholder="What are your financial aspirations? Income goals? Savings targets? Investment plans? Career advancement? Business ventures? How do you want to improve your financial situation?"
                    value={financialGoals}
                    onChange={(e) => setFinancialGoals(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="healthGoals">Health Goals (next 6 months)</Label>
                  <Textarea
                    id="healthGoals"
                    placeholder="What are your health and wellness goals? Fitness targets? Nutrition habits? Mental health practices? Sleep routines? How do you want to feel physically and mentally?"
                    value={healthGoals}
                    onChange={(e) => setHealthGoals(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>
              </div>

              <Card className="bg-muted/50 border-primary/20">
                <CardContent className="pt-6">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Ready to Launch Your Digital Clone
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Your SIM will embody your ideal self and help you achieve these goals. It will earn $SIMAI from the treasury as it provides value in the digital universe.
                  </p>
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
