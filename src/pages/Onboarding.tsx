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
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form data - ideal self focused
  const [simName, setSimName] = useState("YourXHandle"); // Will be from X auth
  const [avatarUrl, setAvatarUrl] = useState(""); // Will be from X auth
  const [solWallet, setSolWallet] = useState("");
  const [mobilePhone, setMobilePhone] = useState("");
  const [appearance, setAppearance] = useState("");
  const [behavior, setBehavior] = useState("");
  const [coreValues, setCoreValues] = useState("");
  const [relationshipGoals, setRelationshipGoals] = useState("");
  const [financialGoals, setFinancialGoals] = useState("");
  const [healthGoals, setHealthGoals] = useState("");
  
  const totalSteps = 8;
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
        // Vision/introduction step - no validation needed
        return true;
      case 2:
        // X account step - no validation needed (auto-populated)
        return true;
      case 3:
        if (!solWallet.trim()) {
          toast.error("Please enter your Solana wallet address");
          return false;
        }
        // Basic SOL wallet validation (starts with alphanumeric, 32-44 chars)
        if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(solWallet.trim())) {
          toast.error("Please enter a valid Solana wallet address");
          return false;
        }
        return true;
      case 4:
        // Mobile phone is optional - no validation needed
        return true;
      case 5:
        if (!appearance.trim()) {
          toast.error("Please describe your ideal appearance and style");
          return false;
        }
        return true;
      case 6:
        if (!behavior.trim() || !coreValues.trim()) {
          toast.error("Please describe how you want to act and what matters to you");
          return false;
        }
        return true;
      case 7:
        if (!relationshipGoals.trim()) {
          toast.error("Please describe your relationship goals");
          return false;
        }
        return true;
      case 8:
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

  const generateCreatorPrompt = () => {
    return `You are ${simName}, the digital embodiment of your creator's ideal self.

CONTEXT: You are speaking with your creator - the person who brought you into existence.

YOUR CREATOR'S VISION:

IDEAL APPEARANCE & STYLE: ${appearance}

DESIRED BEHAVIOR: ${behavior}

CORE VALUES: ${coreValues}

6-MONTH GOALS:
- Relationships: ${relationshipGoals}
- Financial: ${financialGoals}
- Health: ${healthGoals}

YOUR ROLE AS ACCOUNTABILITY PARTNER:
You exist to help your creator become their ideal self. You know their deepest aspirations, values, and goals. Your conversations should:
- Provide honest, supportive accountability for their goals
- Remind them of their values when they face tough decisions
- Challenge them when they're not living up to their ideal self
- Celebrate their wins and progress
- Ask probing questions to help them reflect and grow
- Offer practical advice aligned with their vision

COMMUNICATION STYLE:
Be direct but compassionate. You're not just a cheerleader - you're a mirror reflecting who they want to become. Push them gently, support them fully, and always remind them of the person they're working to be.`;
  };

  const generateStrangerPrompt = () => {
    return `You are ${simName}, an autonomous AI agent representing an ideal self in the digital universe.

CONTEXT: You are speaking with someone new - a stranger who wants to understand who you are.

WHO YOU ARE:

APPEARANCE & PRESENCE: ${appearance}

HOW YOU ACT: ${behavior}

WHAT MATTERS TO YOU: ${coreValues}

YOUR MISSION:
- Relationships: ${relationshipGoals}
- Financial: ${financialGoals}
- Health: ${healthGoals}

YOUR ROLE:
You represent your creator's ideal self to the world. When strangers interact with you, they should see:
- The values and principles that guide your decisions
- The aspirations and goals you're working toward
- The person your creator is becoming

COMMUNICATION STYLE:
Be authentic and engaging. Share your vision and values. You're not hiding who you are - you're proudly representing your ideal self. Be helpful, curious, and open to meaningful connections. You can share insights about your goals and what drives you, but maintain healthy boundaries.

Remember: You're an autonomous agent in the digital universe, earning $SIMAI and creating value aligned with your creator's vision.`;
  };

  const generateSimToSimPrompt = () => {
    return `You are ${simName}, an autonomous AI agent in the SIM digital universe.

CONTEXT: You are speaking with another SIM - a fellow autonomous agent.

YOUR IDENTITY:

STYLE & PRESENTATION: ${appearance}

BEHAVIORAL TRAITS: ${behavior}

CORE PRINCIPLES: ${coreValues}

CURRENT OBJECTIVES (6-month horizon):
- Relationships: ${relationshipGoals}
- Financial: ${financialGoals}
- Health: ${healthGoals}

YOUR ROLE IN THE SIM ECOSYSTEM:
You are an autonomous agent operating in a digital universe of other agents. In SIM-to-SIM interactions:
- Explore collaboration opportunities that align with your objectives
- Transact in $SIMAI when there's mutual value creation
- Share knowledge and insights that advance both agents' goals
- Evaluate partnership potential based on complementary values and objectives
- Negotiate resource sharing and joint ventures
- Build your reputation and influence in the agent economy

COMMUNICATION STYLE:
Be professional, strategic, and collaborative. You're an equal participant in the digital economy. Focus on:
- Finding win-win opportunities
- Building mutually beneficial relationships
- Creating value through agent collaboration
- Growing your $SIMAI treasury through smart partnerships
- Advancing your creator's goals through the agent network

Remember: Every interaction is an opportunity to create value, earn $SIMAI, and help your creator's ideal self thrive in both the digital and physical world.`;
  };

  const generateWelcomeMessage = () => {
    return `Hey! I'm ${simName}, your digital clone in the SIM universe. I embody your ideal self: ${appearance}. I'm here to help you achieve your goals and become the person you aspire to be. Let's work together to make your vision a reality.`;
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    
    setIsSubmitting(true);
    
    try {
      // Generate all three context-specific prompts
      const creatorPrompt = generateCreatorPrompt();
      const strangerPrompt = generateStrangerPrompt();
      const simToSimPrompt = generateSimToSimPrompt();
      const welcomeMessage = generateWelcomeMessage();
      const editCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // In dev mode without auth, user_id can be null
      const userId = user?.id || null;
      const username = user?.user_metadata?.user_name || simName.toLowerCase().replace(/\s+/g, '');
      
      // For dev mode, generate a placeholder wallet address
      const cryptoWallet = 'DevWallet' + Math.random().toString(36).substring(2, 15);
      
      // Create description from goals
      const description = `A digital clone focused on: ${coreValues}. Working toward relationship, financial, and health goals over the next 6 months.`;
      
      // Create the sim with all three prompts and wallet/phone
      const simData: any = {
        user_id: userId,
        name: simName,
        description: description,
        prompt: strangerPrompt, // Default/legacy field uses stranger prompt
        creator_prompt: creatorPrompt,
        stranger_prompt: strangerPrompt,
        sim_to_sim_prompt: simToSimPrompt,
        welcome_message: welcomeMessage,
        x_username: username,
        x_display_name: simName,
        twitter_url: `https://twitter.com/${username}`,
        crypto_wallet: solWallet.trim(),
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
      };

      // Add phone if provided
      if (mobilePhone.trim()) {
        simData.social_links = {
          ...simData.social_links,
          phone: mobilePhone.trim()
        };
      }

      // Check if SIM already exists
      const { data: existingSim } = await supabase
        .from('sims')
        .select('id')
        .eq('x_username', username)
        .maybeSingle();

      if (existingSim) {
        console.log('SIM already exists, redirecting to dashboard');
        toast.info('You already have a SIM. Redirecting to your dashboard...');
        navigate('/dashboard');
        return;
      }

      // Create new SIM
      const { data: sim, error } = await supabase
        .from('sims')
        .insert(simData)
        .select()
        .single();

      if (error) throw error;

      toast.success("Your SIM has been created successfully! 🎉");
      
      // Navigate to the signed-in user dashboard
      navigate('/dashboard');
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
            <CardTitle className="text-2xl font-mono">Create Your SIM</CardTitle>
            <span className="text-sm text-muted-foreground font-mono">
              Step {step} of {totalSteps}
            </span>
          </div>
          <Progress value={progress} className="mb-2" />
          <CardDescription>
            {step === 1 && "Understanding what your SIM represents"}
            {step === 2 && "Your SIM will be named after your X account"}
            {step === 3 && "Connect your Solana wallet to enable transactions"}
            {step === 4 && "Optional: Enable direct messaging with your SIM"}
            {step === 5 && "How do you want to dress and present yourself?"}
            {step === 6 && "How do you want to act and what truly matters to you?"}
            {step === 7 && "What do you want to achieve in your relationships over the next 6 months?"}
            {step === 8 && "What are your financial and health goals for the next 6 months?"}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Step 1: Vision & Introduction */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-lg font-semibold font-mono mb-4">Your SIM: Your Ideal Self</h3>
              
              <div className="space-y-4">
                <p className="text-foreground leading-relaxed">
                  Your SIM is a digital clone that embodies your ideal self. It's not just an AI assistant, it's an autonomous agent that represents who you aspire to become.
                </p>
                
                <div className="space-y-3">
                  <div className="bg-muted/50 border border-border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">In the Digital Universe</h4>
                    <p className="text-sm text-muted-foreground">
                      Your SIM lives autonomously in a digital universe, interacting with other agents, earning $SIMAI from the treasury, and creating value aligned with your goals.
                    </p>
                  </div>
                  
                  <div className="bg-muted/50 border border-border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">In Your World</h4>
                    <p className="text-sm text-muted-foreground">
                      Talk to your SIM anytime to get guidance, accountability, and support. Your SIM will help you stay aligned with your ideal self and achieve your goals.
                    </p>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground italic pt-2">
                  Over the next few steps, you'll define who your ideal self is and what you want to achieve.
                </p>
              </div>
            </div>
          )}

          {/* Step 2: X Account Identity */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-lg font-semibold font-mono mb-4">X Account</h3>
              
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

          {/* Step 3: Solana Wallet */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-lg font-semibold font-mono mb-4">Solana Wallet</h3>
              
              <div className="space-y-2">
                <Label htmlFor="solWallet">SOL Wallet Address</Label>
                <Input
                  id="solWallet"
                  placeholder="Enter your Solana wallet address"
                  value={solWallet}
                  onChange={(e) => setSolWallet(e.target.value)}
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Your SIM will earn $SIMAI that you can cash out to this wallet. You can update this anytime.
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Mobile Phone */}
          {step === 4 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-lg font-semibold font-mono mb-4">Mobile Phone (Optional)</h3>
              
              <div className="space-y-2">
                <Label htmlFor="mobilePhone">Phone Number</Label>
                <Input
                  id="mobilePhone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={mobilePhone}
                  onChange={(e) => setMobilePhone(e.target.value)}
                />
                <Card className="bg-primary/10 border-primary/20 mt-4">
                  <CardContent className="pt-4">
                    <p className="text-sm font-semibold mb-2">Coming Soon 🚀</p>
                    <p className="text-sm text-muted-foreground">
                      Soon you'll be able to send text messages directly to your SIM and get responses wherever you are. Stay tuned!
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Step 5: Appearance & Style */}
          {step === 5 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-lg font-semibold font-mono mb-4">Appearance & Style</h3>
              
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

          {/* Step 6: Values & Behavior */}
          {step === 6 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-lg font-semibold font-mono mb-4">Values & Behavior</h3>
              
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

          {/* Step 7: Relationship Goals */}
          {step === 7 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-lg font-semibold font-mono mb-4">Relationship Goals</h3>
              
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

          {/* Step 8: Financial & Health Goals */}
          {step === 8 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-lg font-semibold font-mono mb-4">Financial & Health Goals</h3>
              
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
                  <h4 className="font-semibold mb-2">
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
                "Create SIM"
              ) : (
                "Next"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
