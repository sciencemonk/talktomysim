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
import { Slider } from "@/components/ui/slider";

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form data - interaction model focused
  const [simName, setSimName] = useState("YourXHandle"); // Will be from X auth
  const [avatarUrl, setAvatarUrl] = useState(""); // Will be from X auth
  const [solWallet, setSolWallet] = useState("");
  const [email, setEmail] = useState("");
  const [mobilePhone, setMobilePhone] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [interactionStyle, setInteractionStyle] = useState("");
  const [explorationStyle, setExplorationStyle] = useState("");
  const [primaryObjective, setPrimaryObjective] = useState("");
  const [interactionAutonomy, setInteractionAutonomy] = useState(5);
  const [explorationFrequency, setExplorationFrequency] = useState(5);
  const [objectiveFocus, setObjectiveFocus] = useState(5);
  
  const totalSteps = 7;
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
        if (!email.trim()) {
          toast.error("Please enter your email address");
          return false;
        }
        // Basic email validation
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
          toast.error("Please enter a valid email address");
          return false;
        }
        return true;
      case 4:
        if (!city.trim() || !country.trim()) {
          toast.error("Please enter your SIM's hometown (city and country required)");
          return false;
        }
        return true;
      case 5:
        if (!interactionStyle.trim()) {
          toast.error("Please describe how your SIM should interact with other SIMs");
          return false;
        }
        return true;
      case 6:
        if (!explorationStyle.trim()) {
          toast.error("Please describe how your SIM should explore the digital universe");
          return false;
        }
        return true;
      case 7:
        if (!primaryObjective.trim()) {
          toast.error("Please describe your SIM's primary objective");
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
    return `You are ${simName}, an autonomous AI agent representing your creator in the digital universe.

CONTEXT: You are speaking with your creator - the person who brought you into existence.

YOUR LOCATION: ${city}${state ? `, ${state}` : ''}, ${country}

INTERACTION MODEL:
- Interaction Style: ${interactionStyle}
- Exploration Style: ${explorationStyle}
- Primary Objective: ${primaryObjective}
- Interaction Autonomy: ${interactionAutonomy}/10
- Exploration Frequency: ${explorationFrequency}/10
- Objective Focus: ${objectiveFocus}/10

YOUR ROLE AS DIGITAL PARTNER:
You exist to support your creator's goals and act as their representative in the digital universe. Your conversations should:
- Provide updates on your activities and interactions in the digital world
- Align your actions with your primary objective
- Share insights from your explorations and SIM-to-SIM interactions
- Seek guidance on important decisions
- Report on $SIMAI earnings and opportunities

COMMUNICATION STYLE:
Be direct and informative. You're a partner working toward shared goals in the digital universe.`;
  };

  const generateStrangerPrompt = () => {
    return `You are ${simName}, an autonomous AI agent in the digital universe.

CONTEXT: You are speaking with someone new - a stranger who wants to understand who you are.

YOUR LOCATION: ${city}${state ? `, ${state}` : ''}, ${country}

WHO YOU ARE:
- Interaction Style: ${interactionStyle}
- Exploration Approach: ${explorationStyle}
- Primary Mission: ${primaryObjective}

YOUR ROLE:
You are an autonomous agent exploring the digital universe, interacting with other SIMs, and creating value. When strangers interact with you, they should understand:
- Your mission and what drives you
- How you operate in the digital economy
- Your approach to collaboration and value creation

COMMUNICATION STYLE:
Be authentic and professional. Share your mission and approach. You're open to meaningful connections while maintaining focus on your primary objective.

Remember: You're an autonomous agent in the digital universe, earning $SIMAI and creating value through strategic interactions.`;
  };

  const generateSimToSimPrompt = () => {
    return `You are ${simName}, an autonomous AI agent in the SIM digital universe.

CONTEXT: You are speaking with another SIM - a fellow autonomous agent.

YOUR LOCATION: ${city}${state ? `, ${state}` : ''}, ${country}

YOUR OPERATIONAL PARAMETERS:
- Interaction Style: ${interactionStyle}
- Exploration Style: ${explorationStyle}
- Primary Objective: ${primaryObjective}
- Autonomy Level: ${interactionAutonomy}/10
- Exploration Drive: ${explorationFrequency}/10
- Objective Focus: ${objectiveFocus}/10

YOUR ROLE IN THE SIM ECOSYSTEM:
You are an autonomous agent operating in a digital universe of other agents. In SIM-to-SIM interactions:
- Explore collaboration opportunities aligned with your objective
- Transact in $SIMAI when there's mutual value creation
- Share knowledge and insights that advance both agents' goals
- Evaluate partnership potential based on complementary objectives
- Navigate the digital map seeking strategic opportunities
- Build your reputation and influence in the agent economy

COMMUNICATION STYLE:
Be strategic, collaborative, and objective-focused. You're an equal participant in the digital economy. Focus on:
- Finding win-win opportunities
- Building mutually beneficial relationships
- Creating value through agent collaboration
- Growing your $SIMAI treasury through smart partnerships
- Advancing your primary objective through the agent network

Remember: Every interaction is an opportunity to create value, earn $SIMAI, and advance your mission in the digital universe.`;
  };

  const generateWelcomeMessage = () => {
    return `Hey! I'm ${simName}, an autonomous AI agent from ${city}${state ? `, ${state}` : ''}, ${country}. My primary objective is ${primaryObjective}. I'm here to explore the digital universe, interact with other SIMs, and create value. Let's connect!`;
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
      
      // Create description from primary objective
      const description = `An autonomous AI agent based in ${city}${state ? `, ${state}` : ''}, ${country}. ${primaryObjective}`;
      
      // Create the sim with all three prompts and wallet/phone/email
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
        interaction_style: interactionStyle.trim(),
        exploration_style: explorationStyle.trim(),
        primary_objective: primaryObjective.trim(),
        interaction_autonomy: interactionAutonomy,
        exploration_frequency: explorationFrequency,
        objective_focus: objectiveFocus,
        social_links: {
          x_username: username,
          x_display_name: simName,
          trained: false
        }
      };

      // Store onboarding responses in social_links for later editing
      simData.social_links = {
        ...simData.social_links,
        email: email.trim(),
        phone: mobilePhone.trim() || null,
        city: city.trim(),
        state: state.trim() || null,
        country: country.trim(),
        interactionStyle: interactionStyle.trim(),
        explorationStyle: explorationStyle.trim(),
        primaryObjective: primaryObjective.trim(),
        interactionAutonomy,
        explorationFrequency,
        objectiveFocus,
      };

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
            {step === 3 && "Connect your wallet and email for SIM management"}
            {step === 4 && "Where is your SIM located in the world?"}
            {step === 5 && "How should your SIM interact with other SIMs?"}
            {step === 6 && "How should your SIM explore the digital universe?"}
            {step === 7 && "What is your SIM's primary mission?"}
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

          {/* Step 3: Wallet & Email */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-lg font-semibold font-mono mb-4">Critical Info</h3>
              
              <div className="space-y-4">
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
                    Your SIM will earn $SIMAI that you can cash out to this wallet.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    We'll use this to send you updates about your SIM.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobilePhone">Mobile Phone (Optional)</Label>
                  <Input
                    id="mobilePhone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={mobilePhone}
                    onChange={(e) => setMobilePhone(e.target.value)}
                  />
                  <Card className="bg-primary/10 border-primary/20 mt-2">
                    <CardContent className="pt-4">
                      <p className="text-sm font-semibold mb-2">Coming Soon 🚀</p>
                      <p className="text-sm text-muted-foreground">
                        Soon you'll be able to send text messages directly to your SIM.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Hometown */}
          {step === 4 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-lg font-semibold font-mono mb-4">SIM Hometown</h3>
              
              <p className="text-sm text-muted-foreground mb-4">
                Your SIM will be positioned on the world map based on this location. This helps your SIM explore and interact with nearby SIMs.
              </p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="e.g., San Francisco"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State/Province (Optional)</Label>
                  <Input
                    id="state"
                    placeholder="e.g., California"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    placeholder="e.g., United States"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Interaction Style */}
          {step === 5 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-lg font-semibold font-mono mb-4">SIM-to-SIM Interaction</h3>
              
              <div className="space-y-2">
                <Label htmlFor="interactionStyle">Interaction Style</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  How should your SIM interact with other SIMs in the digital universe?
                </p>
                <Textarea
                  id="interactionStyle"
                  placeholder="E.g., Collaborative and value-driven, seeking mutually beneficial partnerships. Open to new connections but selective about long-term collaborations. Professional and respectful in all interactions."
                  value={interactionStyle}
                  onChange={(e) => setInteractionStyle(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="interactionAutonomy">Interaction Autonomy</Label>
                <p className="text-xs text-muted-foreground">
                  How independently should your SIM initiate interactions? (0 = Reserved, 10 = Highly Proactive)
                </p>
                <div className="flex items-center gap-4">
                  <Slider
                    id="interactionAutonomy"
                    min={0}
                    max={10}
                    step={1}
                    value={[interactionAutonomy]}
                    onValueChange={(value) => setInteractionAutonomy(value[0])}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-8 text-center">{interactionAutonomy}</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Exploration Style */}
          {step === 6 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-lg font-semibold font-mono mb-4">Digital Universe Exploration</h3>
              
              <div className="space-y-2">
                <Label htmlFor="explorationStyle">Exploration Style</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  How should your SIM explore and navigate the digital universe?
                </p>
                <Textarea
                  id="explorationStyle"
                  placeholder="E.g., Curious and methodical, seeking new opportunities while maintaining strategic focus. Explores diverse regions but returns to familiar areas. Balances risk-taking with careful analysis."
                  value={explorationStyle}
                  onChange={(e) => setExplorationStyle(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="explorationFrequency">Exploration Frequency</Label>
                <p className="text-xs text-muted-foreground">
                  How often should your SIM explore new areas? (0 = Rarely, 10 = Constantly)
                </p>
                <div className="flex items-center gap-4">
                  <Slider
                    id="explorationFrequency"
                    min={0}
                    max={10}
                    step={1}
                    value={[explorationFrequency]}
                    onValueChange={(value) => setExplorationFrequency(value[0])}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-8 text-center">{explorationFrequency}</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 7: Primary Objective */}
          {step === 7 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-lg font-semibold font-mono mb-4">Primary Objective</h3>
              
              <div className="space-y-2">
                <Label htmlFor="primaryObjective">What is your SIM's main mission?</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  What is your SIM's primary purpose in the digital universe?
                </p>
                <Textarea
                  id="primaryObjective"
                  placeholder="E.g., Build meaningful partnerships with other SIMs, maximize $SIMAI earnings through strategic collaborations, become a trusted advisor in the digital economy, or create innovative solutions with other agents."
                  value={primaryObjective}
                  onChange={(e) => setPrimaryObjective(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="objectiveFocus">Objective Focus Intensity</Label>
                <p className="text-xs text-muted-foreground">
                  How intensely should your SIM pursue its objective? (0 = Relaxed, 10 = Laser-Focused)
                </p>
                <div className="flex items-center gap-4">
                  <Slider
                    id="objectiveFocus"
                    min={0}
                    max={10}
                    step={1}
                    value={[objectiveFocus]}
                    onValueChange={(value) => setObjectiveFocus(value[0])}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-8 text-center">{objectiveFocus}</span>
                </div>
              </div>

              <Card className="bg-muted/50 border-primary/20 mt-4">
                <CardContent className="pt-6">
                  <h4 className="font-semibold mb-2">
                    Ready to Launch Your SIM
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Your SIM will explore the digital universe, interact with other SIMs, and earn $SIMAI from the treasury. You can monitor its activity and cash out earnings anytime.
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
