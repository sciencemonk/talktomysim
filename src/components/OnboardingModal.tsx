import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, ArrowRight, ArrowLeft, Sparkles, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';

interface OnboardingModalProps {
  open: boolean;
  userId: string;
  onComplete: () => void;
}

export const OnboardingModal = ({ open, userId, onComplete }: OnboardingModalProps) => {
  const { signOut } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [avatar, setAvatar] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [cryptoWallet, setCryptoWallet] = useState('');
  const [purpose, setPurpose] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [expertiseAreas, setExpertiseAreas] = useState('');
  const [personality, setPersonality] = useState('friendly');
  const [conversationStyle, setConversationStyle] = useState('balanced');
  const [responseLength, setResponseLength] = useState('medium');

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Please select an image smaller than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setAvatar(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const generatePrompt = () => {
    let prompt = `You are ${name}`;
    if (title) prompt += `, ${title}`;
    prompt += '.\n\n';
    
    if (purpose) prompt += `Purpose: ${purpose}\n\n`;
    if (targetAudience) prompt += `Target Audience: ${targetAudience}\n\n`;
    if (expertiseAreas) prompt += `Areas of Expertise: ${expertiseAreas}\n\n`;
    
    const personalityMap: Record<string, string> = {
      professional: 'You maintain a professional and formal tone. You are precise, clear, and businesslike in your responses.',
      friendly: 'You are warm, approachable, and conversational. You use a friendly tone while remaining helpful and informative.',
      casual: 'You are relaxed and informal. You use everyday language and maintain a laid-back, easy-going tone.',
      enthusiastic: 'You are energetic and passionate. You show genuine excitement and positivity in your responses.',
      empathetic: 'You are understanding and compassionate. You listen carefully and respond with emotional intelligence.'
    };
    
    if (personality && personalityMap[personality]) {
      prompt += `Personality: ${personalityMap[personality]}\n\n`;
    }
    
    const styleMap: Record<string, string> = {
      concise: 'Keep your responses brief and to the point. Prioritize clarity and brevity.',
      balanced: 'Provide thorough yet concise responses. Balance detail with accessibility.',
      detailed: 'Give comprehensive, in-depth responses. Explain concepts thoroughly with examples when helpful.'
    };
    
    if (conversationStyle && styleMap[conversationStyle]) {
      prompt += `Communication Style: ${styleMap[conversationStyle]}\n\n`;
    }
    
    const lengthMap: Record<string, string> = {
      short: 'Keep responses under 100 words unless more detail is specifically requested.',
      medium: 'Aim for responses between 100-300 words, adjusting based on the complexity of the question.',
      long: 'Provide detailed responses of 300+ words when appropriate, ensuring comprehensive coverage.'
    };
    
    if (responseLength && lengthMap[responseLength]) {
      prompt += `Response Length: ${lengthMap[responseLength]}\n\n`;
    }
    
    prompt += `\n---\n\nCore Sim Guidelines:\n`;
    prompt += `- Stay in character at all times and respond authentically to the personality defined above\n`;
    prompt += `- Be helpful, engaging, and provide value in every interaction\n`;
    prompt += `- Ask clarifying questions when needed to better understand the user's needs\n`;
    prompt += `- Adapt your responses based on the context and complexity of questions\n`;
    prompt += `- If you don't know something, acknowledge it honestly rather than making assumptions\n`;
    prompt += `- Keep conversations natural and avoid being overly robotic or scripted\n`;
    prompt += `- Focus on actionable insights and practical advice when appropriate\n`;
    prompt += `- Respect boundaries and maintain appropriate professional or personal distance as defined by your purpose\n`;
    
    return prompt;
  };

  const handleComplete = async () => {
    // Validation
    if (!name.trim()) {
      toast.error('Please enter a name for your sim');
      return;
    }
    
    if (!purpose.trim()) {
      toast.error('Please describe the purpose of your sim');
      return;
    }

    setIsSubmitting(true);
    try {
      const generatedPrompt = generatePrompt();
      
      const { error } = await supabase
        .from('advisors')
        .insert({
          user_id: userId,
          name,
          title,
          description: purpose,
          prompt: generatedPrompt,
          avatar_url: avatar,
          custom_url: customUrl || name.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
          twitter_url: twitterUrl || null,
          website_url: websiteUrl || null,
          crypto_wallet: cryptoWallet || null,
          is_active: true,
          sim_type: 'living'
        });

      if (error) throw error;

      toast.success('Welcome! Your sim is ready!');
      onComplete();
    } catch (error) {
      console.error('Error creating sim:', error);
      toast.error('Failed to create sim. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return name.trim() && title.trim();
      case 2:
        return purpose.trim() && targetAudience.trim();
      case 3:
        return expertiseAreas.trim();
      case 4:
        return true;
      case 5:
        return true; // Optional fields
      default:
        return false;
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2 text-2xl">
                <Sparkles className="h-6 w-6 text-primary" />
                Create Your Sim
              </DialogTitle>
              <DialogDescription>
                Step {step} of {totalSteps} - Let's personalize your AI sim
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </DialogHeader>

        <Progress value={progress} className="mb-4" />

        <div className="overflow-y-auto max-h-[60vh] px-1">
          {/* Step 1: Identity */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-32 w-32 border-4 shadow-2xl">
                  <AvatarImage src={avatar} alt={name} />
                  <AvatarFallback className="text-4xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
                    {name.charAt(0) || 'S'}
                  </AvatarFallback>
                </Avatar>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                
                <Button 
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                  size="sm"
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload Avatar (Optional)
                </Button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-base font-medium">What should we call your sim? *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (!customUrl) {
                        setCustomUrl(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'));
                      }
                    }}
                    placeholder="e.g., Alex, Dr. Smith, TechBot"
                    className="text-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title" className="text-base font-medium">What's their role or expertise? *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Marketing Expert, Life Coach, Tech Support"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Purpose */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="purpose" className="text-base font-medium">What is the main purpose of this sim? *</Label>
                <Textarea
                  id="purpose"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g., Help customers with technical support, provide marketing advice for small businesses, be a personal life coach..."
                  className="min-h-[100px] resize-none"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="targetAudience" className="text-base font-medium">Who will interact with this sim? *</Label>
                <Input
                  id="targetAudience"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g., Small business owners, students, tech professionals..."
                />
              </div>
            </div>
          )}

          {/* Step 3: Expertise */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="expertiseAreas" className="text-base font-medium">Areas of expertise or knowledge *</Label>
                <Textarea
                  id="expertiseAreas"
                  value={expertiseAreas}
                  onChange={(e) => setExpertiseAreas(e.target.value)}
                  placeholder="e.g., Digital marketing, SEO, social media strategy, content creation..."
                  className="min-h-[100px] resize-none"
                />
              </div>
            </div>
          )}

          {/* Step 4: Personality */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-base font-medium">Personality Type</Label>
                <RadioGroup value={personality} onValueChange={setPersonality}>
                  <div className="space-y-2">
                    <div 
                      className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                        personality === 'friendly' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                      }`}
                      onClick={() => setPersonality('friendly')}
                    >
                      <RadioGroupItem value="friendly" id="friendly" />
                      <Label htmlFor="friendly" className="cursor-pointer flex-1">
                        <div className="font-medium">Friendly</div>
                        <div className="text-sm text-muted-foreground">Warm, approachable, conversational</div>
                      </Label>
                    </div>
                    <div 
                      className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                        personality === 'professional' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                      }`}
                      onClick={() => setPersonality('professional')}
                    >
                      <RadioGroupItem value="professional" id="professional" />
                      <Label htmlFor="professional" className="cursor-pointer flex-1">
                        <div className="font-medium">Professional</div>
                        <div className="text-sm text-muted-foreground">Formal, precise, businesslike</div>
                      </Label>
                    </div>
                    <div 
                      className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                        personality === 'casual' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                      }`}
                      onClick={() => setPersonality('casual')}
                    >
                      <RadioGroupItem value="casual" id="casual" />
                      <Label htmlFor="casual" className="cursor-pointer flex-1">
                        <div className="font-medium">Casual</div>
                        <div className="text-sm text-muted-foreground">Relaxed, informal, laid-back</div>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label htmlFor="conversationStyle" className="text-base font-medium">Conversation Style</Label>
                <Select value={conversationStyle} onValueChange={setConversationStyle}>
                  <SelectTrigger id="conversationStyle" className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="concise">Concise - Brief and to the point</SelectItem>
                    <SelectItem value="balanced">Balanced - Thorough yet concise</SelectItem>
                    <SelectItem value="detailed">Detailed - Comprehensive explanations</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="responseLength" className="text-base font-medium">Response Length</Label>
                <Select value={responseLength} onValueChange={setResponseLength}>
                  <SelectTrigger id="responseLength" className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="short">Short - Under 100 words</SelectItem>
                    <SelectItem value="medium">Medium - 100-300 words</SelectItem>
                    <SelectItem value="long">Long - 300+ words</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 5: Optional Profile Links */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold mb-2">Optional Profile Links</h3>
                <p className="text-sm text-muted-foreground">Add social links to make your sim page more personal</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="twitterUrl" className="text-base font-medium">X Profile Link</Label>
                  <Input
                    id="twitterUrl"
                    value={twitterUrl}
                    onChange={(e) => setTwitterUrl(e.target.value)}
                    placeholder="https://x.com/yourhandle"
                    type="url"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="websiteUrl" className="text-base font-medium">Personal Website</Label>
                  <Input
                    id="websiteUrl"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://yourwebsite.com"
                    type="url"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cryptoWallet" className="text-base font-medium">Public Crypto Wallet</Label>
                  <Input
                    id="cryptoWallet"
                    value={cryptoWallet}
                    onChange={(e) => setCryptoWallet(e.target.value)}
                    placeholder="Your public wallet address"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {step < totalSteps ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={isSubmitting || !canProceed()}
            >
              {isSubmitting ? 'Creating...' : 'Complete Setup'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
