import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Code
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import simLogoWhite from "@/assets/sim-logo-white.png";
import simHeroLogo from "@/assets/sim-hero-logo.png";
import { useTheme } from "@/hooks/useTheme";

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

const SimDashboard = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sim, setSim] = useState<SimData | null>(null);
  const [user, setUser] = useState<any>(null);

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
      const { data, error } = await supabase
        .from('advisors')
        .select('*')
        .eq('user_id', userId)
        .eq('sim_category', 'Crypto Mail')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSim(data);
      }
    } catch (error) {
      console.error('Error loading SIM:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const updateSim = async (updates: Partial<SimData>) => {
    if (!sim) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('advisors')
        .update(updates)
        .eq('id', sim.id);

      if (error) throw error;

      setSim({ ...sim, ...updates });
      toast.success('SIM updated successfully');
    } catch (error: any) {
      console.error('Error updating SIM:', error);
      toast.error(error.message || 'Failed to update SIM');
    } finally {
      setSaving(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src={resolvedTheme === 'dark' ? simLogoWhite : simHeroLogo} 
                alt="SIM" 
                className="h-8"
              />
              <div>
                <h1 className="text-lg font-bold">SIM Dashboard</h1>
                <p className="text-sm text-muted-foreground">Manage your AI agent</p>
              </div>
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
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* SIM Profile Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-start gap-6">
              <Avatar className="w-24 h-24 border-2 border-primary">
                <AvatarImage src={sim.avatar_url} alt={sim.name} />
                <AvatarFallback className="text-2xl">{sim.name?.charAt(0) || 'S'}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-2">{sim.name}</h2>
                <p className="text-muted-foreground mb-4">{sim.description || 'No description yet'}</p>
                <div className="flex items-center gap-4">
                  <Badge variant="outline">
                    <Shield className="h-3 w-3 mr-1" />
                    Social Proof via X
                  </Badge>
                  {user?.user_metadata?.user_name && (
                    <span className="text-sm text-muted-foreground">
                      @{user.user_metadata.user_name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Configuration Tabs */}
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic" className="gap-2">
              <Settings className="h-4 w-4" />
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="mcp" className="gap-2">
              <Server className="h-4 w-4" />
              MCP Servers
            </TabsTrigger>
            <TabsTrigger value="utility" className="gap-2">
              <Brain className="h-4 w-4" />
              Utility Function
            </TabsTrigger>
            <TabsTrigger value="chat" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Chat Interface
            </TabsTrigger>
          </TabsList>

          {/* Basic Information */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Basic Configuration
                </CardTitle>
                <CardDescription>
                  Configure your SIM's identity and basic settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">SIM Name</Label>
                  <Input
                    id="name"
                    value={sim.name}
                    onChange={(e) => setSim({ ...sim, name: e.target.value })}
                    placeholder="Enter your SIM's name"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={sim.description || ''}
                    onChange={(e) => setSim({ ...sim, description: e.target.value })}
                    placeholder="Describe your SIM's purpose and capabilities"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="avatar">Avatar URL</Label>
                  <Input
                    id="avatar"
                    value={sim.avatar_url || ''}
                    onChange={(e) => setSim({ ...sim, avatar_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <Button 
                  onClick={() => updateSim({ 
                    name: sim.name, 
                    description: sim.description,
                    avatar_url: sim.avatar_url 
                  })}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Basic Info'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* MCP Servers */}
          <TabsContent value="mcp" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Model Context Protocol (MCP) Servers
                </CardTitle>
                <CardDescription>
                  Configure external integrations and data sources for your SIM
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-4">
                    MCP servers provide standardized interfaces for your SIM to interact with external systems like financial data, social media, blockchain, and more.
                  </p>
                  <div className="grid gap-3">
                    <div className="flex items-center justify-between p-3 bg-background rounded border">
                      <div>
                        <p className="font-medium">Financial Data MCP</p>
                        <p className="text-sm text-muted-foreground">Crypto prices, DeFi protocols</p>
                      </div>
                      <Badge variant="outline">Coming Soon</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-background rounded border">
                      <div>
                        <p className="font-medium">Social Media MCP</p>
                        <p className="text-sm text-muted-foreground">X, Discord, Telegram</p>
                      </div>
                      <Badge variant="outline">Coming Soon</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-background rounded border">
                      <div>
                        <p className="font-medium">Blockchain MCP</p>
                        <p className="text-sm text-muted-foreground">Solana, Ethereum networks</p>
                      </div>
                      <Badge variant="outline">Coming Soon</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Utility Function */}
          <TabsContent value="utility" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Utility Function Definition
                </CardTitle>
                <CardDescription>
                  Define what your SIM optimizes for - its goals, constraints, and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="prompt">System Prompt / Utility Function</Label>
                  <Textarea
                    id="prompt"
                    value={sim.prompt}
                    onChange={(e) => setSim({ ...sim, prompt: e.target.value })}
                    placeholder="Define your SIM's optimization goals and constraints..."
                    rows={8}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Example: "Optimize for helping users understand crypto markets while maintaining risk awareness. Prioritize accurate information over speculation."
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    Utility Function Formula
                  </h4>
                  <code className="text-xs block p-3 bg-background rounded border">
                    U(s, a) = Σ [w_i × f_i(s, a)] - Σ [λ_j × c_j(s, a)]
                  </code>
                  <p className="text-xs text-muted-foreground mt-2">
                    Where w_i are weights for objectives, f_i are value functions, λ_j are penalty coefficients, and c_j are constraint violation functions.
                  </p>
                </div>
                <Button 
                  onClick={() => updateSim({ prompt: sim.prompt })}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Utility Function'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Chat Interface */}
          <TabsContent value="chat" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Conversational Interface
                </CardTitle>
                <CardDescription>
                  Configure how your SIM communicates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="welcome">Welcome Message</Label>
                  <Textarea
                    id="welcome"
                    value={sim.welcome_message || ''}
                    onChange={(e) => setSim({ ...sim, welcome_message: e.target.value })}
                    placeholder="Enter the welcome message users see when they start chatting..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="style">Conversation Style</Label>
                    <Input
                      id="style"
                      value={sim.conversation_style || 'balanced'}
                      onChange={(e) => setSim({ ...sim, conversation_style: e.target.value })}
                      placeholder="e.g., professional, friendly, technical"
                    />
                  </div>
                  <div>
                    <Label htmlFor="personality">Personality Type</Label>
                    <Input
                      id="personality"
                      value={sim.personality_type || 'friendly'}
                      onChange={(e) => setSim({ ...sim, personality_type: e.target.value })}
                      placeholder="e.g., helpful, analytical, creative"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="length">Response Length</Label>
                  <select
                    id="length"
                    value={sim.response_length || 'medium'}
                    onChange={(e) => setSim({ ...sim, response_length: e.target.value })}
                    className="w-full p-2 rounded-md border border-input bg-background"
                  >
                    <option value="concise">Concise</option>
                    <option value="medium">Medium</option>
                    <option value="detailed">Detailed</option>
                  </select>
                </div>
                <Button 
                  onClick={() => updateSim({ 
                    welcome_message: sim.welcome_message,
                    conversation_style: sim.conversation_style,
                    personality_type: sim.personality_type,
                    response_length: sim.response_length
                  })}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Chat Settings'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button 
              variant="outline" 
              onClick={() => {
                const customUrl = sim.social_links?.userName || user?.user_metadata?.user_name;
                if (customUrl) {
                  window.open(`/${customUrl}`, '_blank');
                }
              }}
            >
              View Public Profile
            </Button>
            <Button 
              variant="outline"
              onClick={() => toast.info('Analytics coming soon')}
            >
              View Analytics
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SimDashboard;
