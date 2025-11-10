import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { 
  Brain, 
  Server, 
  MessageSquare, 
  Settings, 
  CheckCircle, 
  XCircle,
  LogOut,
  Shield,
  Zap,
  ExternalLink,
  Send,
  Sparkles
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import simLogoWhite from "@/assets/sim-logo-white.png";
import simHeroLogo from "@/assets/sim-hero-logo.png";
import { useTheme } from "@/hooks/useTheme";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import SimpleFooter from "@/components/SimpleFooter";

interface SimData {
  id: string;
  name: string;
  description: string;
  avatar_url: string;
  prompt: string;
  welcome_message: string;
  integrations: any;
  is_verified: boolean;
  verification_status: boolean;
  social_links: any;
  response_length: string;
  conversation_style: string;
  personality_type: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const SimDashboard = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');
  const [loading, setLoading] = useState(true);
  const [sim, setSim] = useState<SimData | null>(null);
  const [user, setUser] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setResolvedTheme(isDark ? 'dark' : 'light');
    } else {
      setResolvedTheme(theme as 'light' | 'dark');
    }
  }, [theme]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/');
        return;
      }

      setUser(session.user);
      await loadSim(session.user.id);
    } catch (error) {
      console.error('Auth error:', error);
      navigate('/');
    }
  };

  const loadSim = async (userId: string) => {
    try {
      // First try to load from the new sims table
      const { data: simData, error: simError } = await supabase
        .from('sims')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (simError && simError.code !== 'PGRST116') {
        console.error('Error loading SIM from sims table:', simError);
      }

      if (simData) {
        console.log('SIM loaded from sims table:', simData);
        setSim({
          id: simData.id,
          name: simData.name,
          description: simData.description || '',
          avatar_url: simData.avatar_url || '',
          prompt: simData.prompt,
          welcome_message: simData.welcome_message || '',
          integrations: simData.integrations,
          is_verified: simData.is_verified,
          verification_status: simData.verification_status,
          social_links: simData.social_links,
          response_length: 'medium',
          conversation_style: 'balanced',
          personality_type: 'helpful',
        });
        return;
      }

      // Fallback to advisors table for legacy users
      const { data: advisorData, error: advisorError } = await supabase
        .from('advisors')
        .select('*')
        .eq('user_id', userId)
        .not('twitter_url', 'is', null)
        .maybeSingle();

      if (advisorError && advisorError.code !== 'PGRST116') {
        console.error('Error loading advisor:', advisorError);
      }

      if (advisorData) {
        console.log('Legacy advisor loaded - migration needed');
        setSim(advisorData);
        toast.info('Your account needs to be upgraded to the new system');
      }
    } catch (error) {
      console.error('Error loading SIM:', error);
      toast.error('Failed to load your SIM');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing || !sim) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue("");
    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat-completion', {
        body: {
          agent: {
            name: sim.name,
            type: 'Personal Assistant',
            subject: 'General Assistance',
            description: sim.description || 'Your personal AI assistant',
            prompt: `You are ${sim.name}, a personal AI assistant. Your role is to help your user with tasks, answer questions, and provide assistance. Be helpful, friendly, and concise. ${sim.prompt || ''}`
          },
          messages: [
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: currentInput }
          ]
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content || 'Sorry, I encountered an error.',
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Chat error:', error);
      toast.error('Failed to get response');
      // Remove the user message on error
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
      setInputValue(currentInput);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!sim) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>No SIM Found</CardTitle>
            <CardDescription>Your SIM is being created. Please refresh the page.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.reload()} className="w-full">
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const xUsername = user?.user_metadata?.user_name;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button onClick={() => navigate('/')} className="flex items-center hover:opacity-80 transition-opacity">
              <img src={resolvedTheme === 'dark' ? simLogoWhite : simHeroLogo} alt="SIM" className="h-8" />
            </button>
            
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => navigate('/about')} className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
                About
              </button>
              <button onClick={() => navigate('/agents')} className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
                Agent Directory
              </button>
              <button onClick={() => navigate('/documentation')} className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
                Documentation
              </button>
              {xUsername && (
                <button onClick={() => navigate(`/${xUsername}`)} className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium flex items-center gap-1">
                  Public Page
                  <ExternalLink className="h-3 w-3" />
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant={sim.is_verified ? "default" : "secondary"} className="gap-1">
                {sim.is_verified ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                {sim.is_verified ? 'Verified' : 'Pending'}
              </Badge>
              <ThemeToggle />
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative border-b border-border bg-gradient-to-b from-background via-background to-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="w-16 h-16 border-2 border-primary ring-2 ring-primary/20">
              <AvatarImage src={sim.avatar_url} alt={sim.name} />
              <AvatarFallback className="text-xl">{sim.name?.charAt(0) || 'S'}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-4xl font-bold text-foreground font-mono tracking-tight">
                {sim.name}
              </h1>
              <p className="text-muted-foreground flex items-center gap-2 mt-1">
                <Sparkles className="h-4 w-4" />
                Your Personal AI Assistant
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Chat Interface - Left/Center */}
            <div className="lg:col-span-2">
              <Card className="h-full flex flex-col bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader className="border-b border-border/50">
                  <CardTitle className="flex items-center gap-2 font-mono">
                    <MessageSquare className="h-5 w-5" />
                    Chat with {sim.name}
                  </CardTitle>
                  <CardDescription>
                    Your AI assistant is here to help you with tasks, answer questions, and provide support
                  </CardDescription>
                </CardHeader>
                
                {/* Messages Area */}
                <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-center">
                      <div>
                        <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          {sim.welcome_message || `Hi! I'm ${sim.name}, your personal AI assistant. How can I help you today?`}
                        </p>
                      </div>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                      >
                        {message.role === 'assistant' && (
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarImage src={sim.avatar_url} alt={sim.name} />
                            <AvatarFallback className="text-sm">{sim.name[0]}</AvatarFallback>
                          </Avatar>
                        )}
                        
                        <div className={`flex-1 ${message.role === 'user' ? 'flex justify-end' : ''}`}>
                          <div className={`
                            ${message.role === 'user' 
                              ? 'bg-[#83f1aa] text-black rounded-3xl px-4 py-3 inline-block max-w-[80%]' 
                              : 'bg-muted/50 border border-border/50 rounded-2xl px-4 py-3 max-w-full'
                            }
                          `}>
                            {message.role === 'user' ? (
                              <p className="text-sm leading-relaxed">{message.content}</p>
                            ) : (
                              <div className="prose prose-sm dark:prose-invert max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {message.content}
                                </ReactMarkdown>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  
                  {isProcessing && (
                    <div className="flex gap-3">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src={sim.avatar_url} alt={sim.name} />
                        <AvatarFallback className="text-sm">{sim.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="bg-muted/50 border border-border/50 rounded-2xl px-4 py-3 inline-block">
                        <div className="flex space-x-1.5">
                          <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></div>
                          <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="w-2 h-2 rounded-full bg-primary animate-bounce"></div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="border-t border-border/50 p-4">
                  <div className="relative">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={`Message ${sim.name}...`}
                      className="pr-12 bg-background/50"
                      disabled={isProcessing}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isProcessing}
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 bg-[#83f1aa] hover:bg-[#83f1aa]/90 text-black"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Quick Actions & Stats - Right Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg font-mono flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate(`/${xUsername}`)}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Public Page
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate(`/${xUsername}/creator`)}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Advanced Settings
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate('/documentation')}
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    Documentation
                  </Button>
                </CardContent>
              </Card>

              {/* Agent Info */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg font-mono flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Agent Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant={sim.is_verified ? "default" : "secondary"}>
                      {sim.is_verified ? 'Verified' : 'Pending'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category</span>
                    <span className="font-medium">Crypto Mail</span>
                  </div>
                  {xUsername && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">X Account</span>
                      <span className="font-medium">@{xUsername}</span>
                    </div>
                  )}
                  <div className="pt-3 border-t border-border/50">
                    <p className="text-muted-foreground text-xs">
                      {sim.description || 'Configure your agent description in advanced settings'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* MCP Status */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg font-mono flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    MCP Servers
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Financial Data</span>
                    <Badge variant="outline" className="text-xs">Coming Soon</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Social Media</span>
                    <Badge variant="outline" className="text-xs">Coming Soon</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Blockchain</span>
                    <Badge variant="outline" className="text-xs">Coming Soon</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <SimpleFooter />
    </div>
  );
};

export default SimDashboard;
