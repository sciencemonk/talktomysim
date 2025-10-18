import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Upload, Link2, Copy, Check, Target, Brain, Users, Sparkles, MessageSquare, Menu, Info } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { AgentType } from '@/types/agent';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const EditSim = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const isMobile = useIsMobile();
  
  // Form state
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [avatar, setAvatar] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  
  // Personalization state
  const [purpose, setPurpose] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [personality, setPersonality] = useState('friendly');
  const [expertiseAreas, setExpertiseAreas] = useState('');
  const [conversationStyle, setConversationStyle] = useState('balanced');
  const [responseLength, setResponseLength] = useState('medium');
  const [specialInstructions, setSpecialInstructions] = useState('');
  
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user ?? null);
      if (!session) {
        navigate('/');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
      if (!session) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const { data: userSim, refetch: refetchUserSim } = useQuery({
    queryKey: ['user-sim', currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return null;
      
      const { data, error } = await supabase
        .from('advisors')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('is_active', true)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) return null;
      
      return {
        id: data.id,
        name: data.name,
        description: data.description || '',
        type: 'General Tutor' as const,
        status: 'active' as const,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        avatar: data.avatar_url,
        prompt: data.prompt,
        title: data.title,
        sim_type: data.sim_type as 'historical' | 'living',
        custom_url: data.custom_url,
        is_featured: false,
        model: 'GPT-4',
        interactions: 0,
        studentsSaved: 0,
        helpfulnessScore: 0,
        avmScore: 0,
        csat: 0,
        performance: 0,
        channels: [],
        channelConfigs: {},
        isPersonal: false,
        voiceTraits: [],
        twitter_url: data.twitter_url,
        website_url: data.website_url,
        crypto_wallet: data.crypto_wallet,
        background_image_url: data.background_image_url
      } as AgentType;
    },
    enabled: !!currentUser
  });

  // Update form state when userSim loads
  useEffect(() => {
    if (userSim) {
      setName(userSim.name);
      setTitle(userSim.title || '');
      setAvatar(userSim.avatar || '');
      setCustomUrl(userSim.custom_url || '');
      
      // Parse existing prompt to extract personalization settings if possible
      const promptText = userSim.prompt || '';
      setPurpose(userSim.description || '');
      setSpecialInstructions(promptText);
    }
  }, [userSim]);

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

    setIsUploading(true);
    
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setAvatar(dataUrl);
      };
      reader.readAsDataURL(file);
      toast.success('Avatar uploaded');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar');
    } finally {
      setIsUploading(false);
    }
  };

  // Generate AI prompt from personalization settings
  const generatePrompt = () => {
    let prompt = `You are ${name}`;
    if (title) prompt += `, ${title}`;
    prompt += '.\n\n';
    
    if (purpose) {
      prompt += `Purpose: ${purpose}\n\n`;
    }
    
    if (targetAudience) {
      prompt += `Target Audience: ${targetAudience}\n\n`;
    }
    
    if (expertiseAreas) {
      prompt += `Areas of Expertise: ${expertiseAreas}\n\n`;
    }
    
    // Personality traits
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
    
    // Conversation style
    const styleMap: Record<string, string> = {
      concise: 'Keep your responses brief and to the point. Prioritize clarity and brevity.',
      balanced: 'Provide thorough yet concise responses. Balance detail with accessibility.',
      detailed: 'Give comprehensive, in-depth responses. Explain concepts thoroughly with examples when helpful.'
    };
    
    if (conversationStyle && styleMap[conversationStyle]) {
      prompt += `Communication Style: ${styleMap[conversationStyle]}\n\n`;
    }
    
    // Response length
    const lengthMap: Record<string, string> = {
      short: 'Keep responses under 100 words unless more detail is specifically requested.',
      medium: 'Aim for responses between 100-300 words, adjusting based on the complexity of the question.',
      long: 'Provide detailed responses of 300+ words when appropriate, ensuring comprehensive coverage.'
    };
    
    if (responseLength && lengthMap[responseLength]) {
      prompt += `Response Length: ${lengthMap[responseLength]}\n\n`;
    }
    
    if (specialInstructions) {
      prompt += `Special Instructions:\n${specialInstructions}`;
    }
    
    return prompt;
  };

  const copyUrl = () => {
    const url = customUrl ? `${window.location.origin}/${customUrl}` : '';
    navigator.clipboard.writeText(url);
    setUrlCopied(true);
    setTimeout(() => setUrlCopied(false), 2000);
    toast.success('URL copied to clipboard');
  };

  const handleSave = async () => {
    if (!userSim) return;
    
    // Validate required fields
    if (!name.trim()) {
      toast.error('Please enter a name for your sim');
      return;
    }
    
    if (!purpose.trim()) {
      toast.error('Please describe the purpose of your sim');
      return;
    }
    
    setIsSaving(true);
    try {
      const generatedPrompt = generatePrompt();
      
      const { error } = await supabase
        .from('advisors')
        .update({
          name,
          title,
          description: purpose,
          prompt: generatedPrompt,
          avatar_url: avatar,
          custom_url: customUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', userSim.id);

      if (error) throw error;

      await refetchUserSim();
      toast.success('Sim personalization saved successfully!', {
        description: 'You can now access all features'
      });
    } catch (error) {
      console.error('Error saving sim:', error);
      toast.error('Failed to update sim');
    } finally {
      setIsSaving(false);
    }
  };

  if (!userSim) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="p-6">
          <p className="text-muted-foreground">Loading your sim...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header with Menu */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b">
          <div className="flex items-center justify-between p-3">
            <SidebarTrigger className="h-10 w-10">
              <Menu className="h-5 w-5" />
            </SidebarTrigger>
            <h1 className="text-lg font-semibold">Sim Settings</h1>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className={`flex flex-col ${isMobile ? 'pt-[73px] h-screen' : 'h-screen'}`}>
        <div className="max-w-4xl mx-auto px-8 py-8 flex-1 overflow-auto w-full">
          <div className="space-y-12 pb-8">
              {/* Avatar & Basic Info Section */}
              <div className="space-y-6 pb-8 border-b">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-semibold">Identity</h2>
                </div>
                
                <div className="flex flex-col md:flex-row gap-8 items-start">
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
                      disabled={isUploading}
                      size="sm"
                      className="gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      {isUploading ? 'Uploading...' : 'Change Avatar'}
                    </Button>
                  </div>

                  <div className="flex-1 space-y-4 w-full">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-base font-medium">What should we call your sim?</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Alex, Dr. Smith, TechBot"
                        className="text-lg"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-base font-medium">What's their role or expertise?</Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Marketing Expert, Life Coach, Tech Support"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="custom-url" className="text-sm font-medium flex items-center gap-2">
                        <Link2 className="h-4 w-4" />
                        Custom URL (optional)
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="custom-url"
                          value={customUrl}
                          onChange={(e) => setCustomUrl(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                          placeholder="your-sim-name"
                          className="font-mono text-sm"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={copyUrl}
                          disabled={!customUrl}
                        >
                          {urlCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Purpose & Goals Section */}
              <div className="space-y-6 pb-8 border-b">
                <div className="flex items-center gap-3">
                  <Target className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-semibold">Purpose & Goals</h2>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="purpose" className="text-base font-medium flex items-center gap-2">
                      <Info className="h-4 w-4 text-muted-foreground" />
                      What is the main purpose of this sim?
                    </Label>
                    <Textarea
                      id="purpose"
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      placeholder="e.g., Help customers with technical support, provide marketing advice for small businesses, be a personal life coach..."
                      className="min-h-[100px] resize-none"
                    />
                    <p className="text-sm text-muted-foreground">Describe what you want this sim to help with.</p>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="targetAudience" className="text-base font-medium">Who will interact with this sim?</Label>
                    <Input
                      id="targetAudience"
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      placeholder="e.g., Small business owners, students, tech professionals..."
                    />
                    <p className="text-sm text-muted-foreground">Understanding your audience helps tailor the sim's approach.</p>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="expertiseAreas" className="text-base font-medium">Areas of expertise or knowledge</Label>
                    <Textarea
                      id="expertiseAreas"
                      value={expertiseAreas}
                      onChange={(e) => setExpertiseAreas(e.target.value)}
                      placeholder="e.g., Digital marketing, SEO, social media strategy, content creation..."
                      className="min-h-[80px] resize-none"
                    />
                    <p className="text-sm text-muted-foreground">List topics or domains where this sim should be knowledgeable.</p>
                  </div>
                </div>
              </div>

              {/* Personality & Style Section */}
              <div className="space-y-6 pb-8 border-b">
                <div className="flex items-center gap-3">
                  <Brain className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-semibold">Personality & Communication Style</h2>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Personality Type</Label>
                    <RadioGroup value={personality} onValueChange={setPersonality}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex items-center space-x-3 p-4 border rounded-lg hover:border-primary cursor-pointer transition-colors">
                          <RadioGroupItem value="professional" id="professional" />
                          <Label htmlFor="professional" className="cursor-pointer flex-1">
                            <div className="font-medium">Professional</div>
                            <div className="text-sm text-muted-foreground">Formal, precise, and businesslike</div>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-3 p-4 border rounded-lg hover:border-primary cursor-pointer transition-colors">
                          <RadioGroupItem value="friendly" id="friendly" />
                          <Label htmlFor="friendly" className="cursor-pointer flex-1">
                            <div className="font-medium">Friendly</div>
                            <div className="text-sm text-muted-foreground">Warm, approachable, conversational</div>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-3 p-4 border rounded-lg hover:border-primary cursor-pointer transition-colors">
                          <RadioGroupItem value="casual" id="casual" />
                          <Label htmlFor="casual" className="cursor-pointer flex-1">
                            <div className="font-medium">Casual</div>
                            <div className="text-sm text-muted-foreground">Relaxed, informal, easy-going</div>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-3 p-4 border rounded-lg hover:border-primary cursor-pointer transition-colors">
                          <RadioGroupItem value="enthusiastic" id="enthusiastic" />
                          <Label htmlFor="enthusiastic" className="cursor-pointer flex-1">
                            <div className="font-medium">Enthusiastic</div>
                            <div className="text-sm text-muted-foreground">Energetic, passionate, positive</div>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-3 p-4 border rounded-lg hover:border-primary cursor-pointer transition-colors">
                          <RadioGroupItem value="empathetic" id="empathetic" />
                          <Label htmlFor="empathetic" className="cursor-pointer flex-1">
                            <div className="font-medium">Empathetic</div>
                            <div className="text-sm text-muted-foreground">Understanding, compassionate, supportive</div>
                          </Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="conversationStyle" className="text-base font-medium">Conversation Style</Label>
                    <Select value={conversationStyle} onValueChange={setConversationStyle}>
                      <SelectTrigger id="conversationStyle">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="concise">Concise - Brief and to the point</SelectItem>
                        <SelectItem value="balanced">Balanced - Thorough yet concise</SelectItem>
                        <SelectItem value="detailed">Detailed - Comprehensive explanations</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="responseLength" className="text-base font-medium">Typical Response Length</Label>
                    <Select value={responseLength} onValueChange={setResponseLength}>
                      <SelectTrigger id="responseLength">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="short">Short - Under 100 words</SelectItem>
                        <SelectItem value="medium">Medium - 100-300 words</SelectItem>
                        <SelectItem value="long">Long - 300+ words when appropriate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Advanced Instructions Section */}
              <div className="space-y-6 pb-8">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-semibold">Advanced Instructions</h2>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="specialInstructions" className="text-base font-medium">Special instructions or guidelines (optional)</Label>
                  <Textarea
                    id="specialInstructions"
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="e.g., Always ask clarifying questions before giving advice, never give medical advice, focus on actionable steps..."
                    className="min-h-[120px] resize-none font-mono text-sm"
                  />
                  <p className="text-sm text-muted-foreground">Add any specific rules, limitations, or behaviors you want your sim to follow.</p>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-4 border-t">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full py-6 text-lg"
                >
                  {isSaving ? 'Saving Personalization...' : 'Save Personalization'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

export default EditSim;
