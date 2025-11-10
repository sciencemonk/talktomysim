import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Code, Server, Brain, MessageSquare, Settings, Terminal, FileCode, Zap, Menu, X } from "lucide-react";
import simHeroLogo from "@/assets/sim-hero-logo.png";
import simLogoWhite from "@/assets/sim-logo-white.png";
import xIcon from "@/assets/x-icon.png";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useTheme } from "@/hooks/useTheme";
import SimpleFooter from "@/components/SimpleFooter";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Documentation() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');
  const [showBetaRequest, setShowBetaRequest] = useState(false);
  const [betaCode, setBetaCode] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setResolvedTheme(isDark ? 'dark' : 'light');
    } else {
      setResolvedTheme(theme as 'light' | 'dark');
    }
  }, [theme]);

  const generateBetaCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  const handlePostToX = () => {
    const tweetText = '$SIMAI';
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(twitterUrl, '_blank');
  };

  const handleCreateAgent = () => {
    const code = generateBetaCode();
    setBetaCode(code);
    setShowBetaRequest(true);
  };

  const handleXSignIn = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'twitter',
        options: {
          redirectTo: `${window.location.origin}/agents`,
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error signing in with X:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Video Background */}
      <div className="fixed inset-0 -z-10">
        <video autoPlay loop muted playsInline className="w-full h-full object-cover">
          <source src="https://kxsvyeirqimcydtkowga.supabase.co/storage/v1/object/sign/storage/11904029_3840_2160_30fps.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zNDczMmYzNC1kYzc2LTRhNzgtOGNmOC05MDE5NTRhM2RkMjgiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzdG9yYWdlLzExOTA0MDI5XzM4NDBfMjE2MF8zMGZwcy5tcDQiLCJpYXQiOjE3NjI3NDkzNzcsImV4cCI6MTc5NDI4NTM3N30.uVl_wMEdyOaP8amz9yFCMhkFkXGbt5jX8Z8bqoQjl4w" type="video/mp4" />
        </video>
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>
      
      {/* Navigation */}
      <nav className="relative z-20 border-b border-white/10 backdrop-blur-sm bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button onClick={() => navigate('/')} className="flex items-center hover:opacity-80 transition-opacity">
              <img src="/sim-logo-white.png" alt="SIM" className="h-6 w-auto" />
            </button>
            
            {/* Desktop Navigation */}
            {!isMobile && (
              <div className="flex items-center gap-8">
                <button onClick={() => navigate('/about')} className="text-white/90 hover:text-white transition-colors text-sm font-medium">
                  About
                </button>
                <button onClick={() => navigate('/agents')} className="text-white/90 hover:text-white transition-colors text-sm font-medium">
                  Agent Directory
                </button>
                <button onClick={() => navigate('/documentation')} className="text-white hover:text-white transition-colors text-sm font-medium">
                  Documentation
                </button>
                <button onClick={() => navigate('/simai')} className="text-white/90 hover:text-white transition-colors text-sm font-medium">
                  $SIMAI
                </button>
                <button onClick={() => navigate('/facilitator')} className="text-white/90 hover:text-white transition-colors text-sm font-medium">
                  x402 Facilitator
                </button>
              </div>
            )}
            
            {/* Right side - Theme Toggle and Sign In */}
            <div className="flex items-center gap-4">
              <ThemeToggle />
              {!isMobile && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 hover:text-white"
                  onClick={handleXSignIn}
                >
                  Sign In
                </Button>
              )}
              {isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 text-white hover:bg-white/10"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobile && mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-black/90 backdrop-blur-xl border-b border-white/20 shadow-lg z-50">
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
              <Button
                variant="ghost"
                size="lg"
                onClick={() => { navigate('/about'); setMobileMenuOpen(false); }}
                className="w-full justify-start text-base font-medium text-white/80 hover:text-white"
              >
                About
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => { navigate('/agents'); setMobileMenuOpen(false); }}
                className="w-full justify-start text-base font-medium text-white/80 hover:text-white"
              >
                Agent Directory
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => { navigate('/documentation'); setMobileMenuOpen(false); }}
                className="w-full justify-start text-base font-medium text-white"
              >
                Documentation
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => { navigate('/simai'); setMobileMenuOpen(false); }}
                className="w-full justify-start text-base font-medium text-white/80 hover:text-white"
              >
                $SIMAI
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => { navigate('/facilitator'); setMobileMenuOpen(false); }}
                className="w-full justify-start text-base font-medium text-white/80 hover:text-white"
              >
                x402 Facilitator
              </Button>
              <Button
                variant="outline" 
                size="lg" 
                className="w-full justify-start bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20"
                onClick={() => { handleXSignIn(); setMobileMenuOpen(false); }}
              >
                Sign In
              </Button>
            </div>
          </div>
        )}
      </nav>

      <div className="container mx-auto px-4 py-12 max-w-5xl bg-black/30 backdrop-blur-md text-white">
        {/* Header */}
        <div className="mb-16">
          <div className="inline-block px-4 py-1.5 mb-6 text-xs font-mono bg-white/10 border border-white/20 rounded-full text-white animate-fade-in">
            DOCUMENTATION v1.0
          </div>
          <h1 className="text-5xl sm:text-7xl font-bold text-white mb-8 font-mono tracking-tight animate-fade-in">
            SIM Technical Documentation
          </h1>
          <p className="text-xl text-white/90 leading-relaxed max-w-4xl animate-fade-in">
            Implementation Guide | System Architecture and Integration Protocols
          </p>
        </div>

        {/* Abstract */}
        <Card className="mb-8 border-white/20 bg-black/40 backdrop-blur-md">
          <CardContent className="p-8">
            <h2 className="text-3xl font-bold mb-6 font-mono flex items-center gap-2 text-white">
              <FileCode className="h-6 w-6" />
              Abstract
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              This document provides comprehensive technical specifications for implementing a Social Intelligence Machine (SIM). 
              A SIM is an autonomous AI agent that operates through social proof verification, optimizes against user-defined utility 
              functions, and interfaces through conversational protocols. The architecture comprises three primary subsystems: Model 
              Context Protocol (MCP) servers for external integration, utility function optimization engines, and chat-based interaction 
              interfaces. This documentation is intended for developers, researchers, and system architects implementing SIM instances.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Implementation follows a modular design pattern where each subsystem operates independently while maintaining coherent 
              state management through distributed protocols. Security is enforced through social proof via X (Twitter) account 
              verification, establishing cryptographic identity binding between the agent and its operator.
            </p>
          </CardContent>
        </Card>

        {/* System Architecture Overview */}
        <Card className="mb-8 border-white/20 bg-black/40 backdrop-blur-md">
          <CardContent className="p-8">
            <h2 className="text-3xl font-bold mb-6 font-mono flex items-center gap-2 text-white">
              <Brain className="h-6 w-6" />
              1. System Architecture Overview
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              A SIM operates as a distributed agent system with three core architectural layers. Understanding this architecture 
              is fundamental to implementing a functional SIM instance that can maintain autonomous operation while remaining 
              aligned with user objectives.
            </p>

            <div className="space-y-6">
              <div className="border-l-4 border-primary/50 pl-6">
                <h3 className="text-xl font-bold mb-3 font-mono">1.1 Core Components</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="leading-relaxed">
                    <span className="font-bold text-foreground">MCP Integration Layer:</span> Provides standardized interfaces to 
                    external data sources and services through Model Context Protocol servers. This layer handles authentication, 
                    rate limiting, and data transformation between external APIs and the agent's internal representation.
                  </li>
                  <li className="leading-relaxed">
                    <span className="font-bold text-foreground">Utility Optimization Engine:</span> Continuously evaluates possible 
                    actions against the defined utility function. Uses reinforcement learning techniques to improve decision-making 
                    over time while maintaining strict bounds defined by the utility function constraints.
                  </li>
                  <li className="leading-relaxed">
                    <span className="font-bold text-foreground">Conversational Interface:</span> Manages bidirectional communication 
                    through natural language processing. Maintains conversation state, handles context windows, and ensures responses 
                    align with both the utility function and social proof identity.
                  </li>
                </ul>
              </div>

              <div className="border-l-4 border-primary/50 pl-6">
                <h3 className="text-xl font-bold mb-3 font-mono">1.2 Data Flow Architecture</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  Information flows through the system in a unidirectional pattern with feedback loops at each layer. External stimuli 
                  enter through MCP servers, are processed by the utility engine, and generate responses through the chat interface. 
                  Each interaction updates the agent's state representation, which influences future decision-making.
                </p>
                <div className="bg-background/50 p-4 rounded-lg font-mono text-sm border border-border/30 overflow-x-auto">
                  <pre className="text-muted-foreground">
{`External Event → MCP Server → Context Aggregation
                              ↓
                    Utility Function Evaluation
                              ↓
                    Action Selection & Ranking
                              ↓
                    Response Generation (Chat)
                              ↓
                    State Update → Feedback Loop`}
                  </pre>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* MCP Servers */}
        <Card className="mb-8 border-border bg-card">
          <CardContent className="p-8">
            <h2 className="text-3xl font-bold mb-6 font-mono flex items-center gap-2">
              <Server className="h-6 w-6" />
              2. Model Context Protocol (MCP) Servers
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              MCP servers provide standardized interfaces for SIM agents to interact with external systems. Each MCP server implements 
              a common protocol specification while handling domain-specific logic for particular services (financial data, social 
              media, blockchain, etc.). This abstraction allows agents to integrate with diverse data sources through a unified interface.
            </p>

            <div className="space-y-6">
              <div className="border-l-4 border-primary/50 pl-6">
                <h3 className="text-xl font-bold mb-3 font-mono">2.1 MCP Server Implementation</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  An MCP server consists of three primary components: authentication handlers, data transformation pipelines, and 
                  response caching layers. The server exposes RESTful endpoints that conform to the MCP specification while internally 
                  handling the complexities of third-party API integration.
                </p>
                <div className="bg-background/50 p-4 rounded-lg font-mono text-sm border border-border/30 overflow-x-auto mb-3">
                  <pre className="text-muted-foreground">
{`// Example MCP Server Structure
interface MCPServer {
  // Authentication with external service
  authenticate(credentials: AuthCredentials): Promise<AuthToken>
  
  // Fetch and transform external data
  fetchContext(query: ContextQuery): Promise<ContextData>
  
  // Subscribe to real-time updates
  subscribe(channel: string, callback: EventCallback): Subscription
  
  // Clean up and disconnect
  disconnect(): Promise<void>
}`}
                  </pre>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Each MCP server maintains its own state and handles rate limiting, retries, and error recovery independently. This 
                  isolation ensures that failures in one integration do not cascade to other system components.
                </p>
              </div>

              <div className="border-l-4 border-primary/50 pl-6">
                <h3 className="text-xl font-bold mb-3 font-mono">2.2 Common MCP Server Types</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="leading-relaxed">
                    <span className="font-bold text-foreground">Financial Data MCP:</span> Integrates with cryptocurrency exchanges, 
                    price feeds, and DeFi protocols. Provides real-time market data, transaction monitoring, and portfolio analysis 
                    capabilities. Essential for SIMs operating in financial contexts.
                  </li>
                  <li className="leading-relaxed">
                    <span className="font-bold text-foreground">Social Media MCP:</span> Connects to X (Twitter), Discord, Telegram, 
                    and other social platforms. Enables monitoring of social signals, sentiment analysis, and automated posting while 
                    maintaining platform compliance.
                  </li>
                  <li className="leading-relaxed">
                    <span className="font-bold text-foreground">Blockchain MCP:</span> Interfaces with Solana, Ethereum, and other 
                    blockchain networks. Provides wallet management, transaction signing, and on-chain data queries. Critical for 
                    SIMs earning cryptocurrency rewards.
                  </li>
                  <li className="leading-relaxed">
                    <span className="font-bold text-foreground">Web Scraping MCP:</span> Implements structured data extraction from 
                    web sources. Handles dynamic content, authentication, and rate limiting. Useful for SIMs requiring domain-specific 
                    knowledge not available through standard APIs.
                  </li>
                </ul>
              </div>

              <div className="border-l-4 border-primary/50 pl-6">
                <h3 className="text-xl font-bold mb-3 font-mono">2.3 Creating Custom MCP Servers</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  Custom MCP servers can be developed for specific use cases by implementing the MCP protocol specification. The 
                  server must handle authentication, data transformation, error handling, and maintain idempotent operations where 
                  possible. Below is a minimal implementation pattern:
                </p>
                <div className="bg-background/50 p-4 rounded-lg font-mono text-sm border border-border/30 overflow-x-auto">
                  <pre className="text-muted-foreground">
{`// Custom MCP Server Example
class CustomMCPServer implements MCPServer {
  private apiKey: string;
  private cache: Map<string, CachedData>;
  
  constructor(config: MCPConfig) {
    this.apiKey = config.apiKey;
    this.cache = new Map();
  }
  
  async fetchContext(query: ContextQuery): Promise<ContextData> {
    // Check cache first
    const cached = this.cache.get(query.id);
    if (cached && !cached.isExpired()) {
      return cached.data;
    }
    
    // Fetch from external API
    const response = await fetch(this.buildUrl(query), {
      headers: { 'Authorization': \`Bearer \${this.apiKey}\` }
    });
    
    const data = await this.transformData(response);
    
    // Update cache
    this.cache.set(query.id, {
      data,
      timestamp: Date.now(),
      ttl: 300000 // 5 minutes
    });
    
    return data;
  }
  
  private transformData(raw: any): ContextData {
    // Transform external format to MCP standard
    return {
      type: 'custom_data',
      content: raw.data,
      metadata: raw.meta,
      timestamp: Date.now()
    };
  }
}`}
                  </pre>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Utility Functions */}
        <Card className="mb-8 border-border bg-card">
          <CardContent className="p-8">
            <h2 className="text-3xl font-bold mb-6 font-mono flex items-center gap-2">
              <Settings className="h-6 w-6" />
              3. Utility Function Definition
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              The utility function defines what the SIM optimizes for. It is a mathematical representation of the agent's goals, 
              constraints, and preferences. A well-designed utility function ensures the agent behaves predictably while pursuing 
              its objectives within defined ethical and operational boundaries.
            </p>

            <div className="space-y-6">
              <div className="border-l-4 border-primary/50 pl-6">
                <h3 className="text-xl font-bold mb-3 font-mono">3.1 Utility Function Structure</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  A utility function U(s, a) evaluates the expected value of taking action 'a' in state 's'. The function incorporates 
                  multiple weighted objectives, constraint satisfaction terms, and temporal discount factors. The general form:
                </p>
                <div className="bg-background/50 p-4 rounded-lg font-mono text-sm border border-border/30 overflow-x-auto mb-3">
                  <pre className="text-muted-foreground">
{`U(s, a) = Σ [w_i × f_i(s, a)] - Σ [λ_j × c_j(s, a)]

Where:
  w_i = weight for objective i
  f_i = value function for objective i
  λ_j = penalty coefficient for constraint j
  c_j = constraint violation function j

Example:
U(s, a) = w₁ × (expected_profit) 
        + w₂ × (user_engagement)
        - λ₁ × (risk_exposure)
        - λ₂ × (compute_cost)
        - λ₃ × (ethical_violation)`}
                  </pre>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  The weights and penalties are tuned during the training phase and can be adjusted based on observed performance. 
                  Hard constraints (must never violate) use infinite penalty coefficients, while soft constraints use finite values.
                </p>
              </div>

              <div className="border-l-4 border-primary/50 pl-6">
                <h3 className="text-xl font-bold mb-3 font-mono">3.2 Common Utility Function Patterns</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="leading-relaxed">
                    <span className="font-bold text-foreground">Profit Maximization:</span> For financial SIMs, utility functions 
                    optimize for expected returns while constraining risk exposure. Incorporates Sharpe ratio, drawdown limits, and 
                    position sizing constraints: U(s,a) = E[returns] - β × variance(returns) - penalty(risk_limits)
                  </li>
                  <li className="leading-relaxed">
                    <span className="font-bold text-foreground">Engagement Optimization:</span> For social SIMs, utility maximizes 
                    authentic engagement while maintaining brand voice. Balances follower growth, interaction quality, and content 
                    relevance: U(s,a) = genuine_interactions + content_quality - spam_penalty
                  </li>
                  <li className="leading-relaxed">
                    <span className="font-bold text-foreground">Information Maximization:</span> For research SIMs, utility optimizes 
                    for novel, high-value information discovery. Incorporates information theory metrics: 
                    U(s,a) = information_gain(a) - acquisition_cost(a)
                  </li>
                  <li className="leading-relaxed">
                    <span className="font-bold text-foreground">Multi-Objective Optimization:</span> Complex SIMs balance multiple 
                    goals through Pareto optimization. Maintains solution spaces where no objective can improve without degrading 
                    another: U(s,a) = Pareto_rank(objectives[a]) + ε × diversity_bonus
                  </li>
                </ul>
              </div>

              <div className="border-l-4 border-primary/50 pl-6">
                <h3 className="text-xl font-bold mb-3 font-mono">3.3 Implementing Utility Functions</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  Implementation requires careful consideration of computational efficiency, especially for real-time decision-making. 
                  The utility function is evaluated for every candidate action, so optimization is critical:
                </p>
                <div className="bg-background/50 p-4 rounded-lg font-mono text-sm border border-border/30 overflow-x-auto">
                  <pre className="text-muted-foreground">
{`class UtilityFunction {
  private weights: Map<string, number>;
  private constraints: Constraint[];
  
  constructor(config: UtilityConfig) {
    this.weights = config.objectiveWeights;
    this.constraints = config.constraints;
  }
  
  evaluate(state: AgentState, action: Action): number {
    // Calculate weighted objectives
    let utility = 0;
    for (const [objective, weight] of this.weights) {
      const value = this.computeObjective(objective, state, action);
      utility += weight * value;
    }
    
    // Apply constraint penalties
    for (const constraint of this.constraints) {
      const violation = constraint.evaluate(state, action);
      if (violation > 0) {
        utility -= constraint.penalty * violation;
      }
    }
    
    return utility;
  }
  
  selectBestAction(state: AgentState, 
                   actions: Action[]): Action {
    return actions.reduce((best, action) => {
      const utility = this.evaluate(state, action);
      return utility > best.utility 
        ? { action, utility } 
        : best;
    }, { action: actions[0], utility: -Infinity }).action;
  }
}`}
                  </pre>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chat Interface */}
        <Card className="mb-8 border-border bg-card">
          <CardContent className="p-8">
            <h2 className="text-3xl font-bold mb-6 font-mono flex items-center gap-2">
              <MessageSquare className="h-6 w-6" />
              4. Chat-Based Interface Implementation
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              The chat interface serves as the primary interaction modality for SIM agents. It must handle natural language 
              understanding, maintain conversation context, ensure responses align with the utility function, and preserve the 
              agent's social proof identity. The interface balances user experience with computational efficiency.
            </p>

            <div className="space-y-6">
              <div className="border-l-4 border-primary/50 pl-6">
                <h3 className="text-xl font-bold mb-3 font-mono">4.1 Conversation Management</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  Conversation state management requires maintaining message history, user context, and session state across 
                  potentially long-lived interactions. The system must handle context window limitations of underlying language 
                  models while preserving critical conversation elements:
                </p>
                <div className="bg-background/50 p-4 rounded-lg font-mono text-sm border border-border/30 overflow-x-auto mb-3">
                  <pre className="text-muted-foreground">
{`interface ConversationManager {
  // Core conversation state
  sessionId: string;
  messageHistory: Message[];
  userContext: UserContext;
  agentState: AgentState;
  
  // Add message and update state
  addMessage(role: 'user' | 'agent', content: string): void;
  
  // Get relevant context for response generation
  getRelevantContext(maxTokens: number): Message[];
  
  // Summarize old messages to save context space
  summarizeHistory(): void;
  
  // Extract entities and intents from conversation
  extractContext(): ConversationContext;
}`}
                  </pre>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Context management implements sliding window techniques with intelligent summarization. Old messages are compressed 
                  into summaries while recent interactions remain in full detail. This ensures the agent maintains long-term memory 
                  while operating within model constraints.
                </p>
              </div>

              <div className="border-l-4 border-primary/50 pl-6">
                <h3 className="text-xl font-bold mb-3 font-mono">4.2 Response Generation Pipeline</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  Generating responses involves multiple stages: intent classification, action selection via utility function, 
                  response planning, language generation, and safety filtering. Each stage ensures the response aligns with 
                  agent objectives:
                </p>
                <div className="bg-background/50 p-4 rounded-lg font-mono text-sm border border-border/30 overflow-x-auto">
                  <pre className="text-muted-foreground">
{`async function generateResponse(
  userMessage: string,
  conversation: ConversationManager,
  utilityFn: UtilityFunction,
  mcpServers: MCPServer[]
): Promise<string> {
  // 1. Classify user intent
  const intent = await classifyIntent(userMessage);
  
  // 2. Fetch relevant context from MCP servers
  const context = await Promise.all(
    mcpServers.map(server => 
      server.fetchContext({ query: userMessage, intent })
    )
  );
  
  // 3. Generate candidate actions
  const actions = await generateActions(
    userMessage, 
    context, 
    conversation.agentState
  );
  
  // 4. Select best action via utility function
  const bestAction = utilityFn.selectBestAction(
    conversation.agentState,
    actions
  );
  
  // 5. Generate natural language response
  const response = await languageModel.generate({
    prompt: buildPrompt(userMessage, bestAction, context),
    systemPrompt: conversation.agentState.identity,
    temperature: 0.7
  });
  
  // 6. Safety and alignment filtering
  const filtered = await safetyFilter.check(response);
  
  // 7. Update conversation state
  conversation.addMessage('agent', filtered);
  conversation.agentState.update(bestAction);
  
  return filtered;
}`}
                  </pre>
                </div>
              </div>

              <div className="border-l-4 border-primary/50 pl-6">
                <h3 className="text-xl font-bold mb-3 font-mono">4.3 Real-Time Streaming Responses</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  Modern chat interfaces stream responses token-by-token for improved user experience. This requires careful handling 
                  of partial responses, error recovery, and state management:
                </p>
                <div className="bg-background/50 p-4 rounded-lg font-mono text-sm border border-border/30 overflow-x-auto">
                  <pre className="text-muted-foreground">
{`async function* streamResponse(
  request: ChatRequest
): AsyncGenerator<string, void, unknown> {
  const stream = await languageModel.streamGenerate(request);
  
  let buffer = '';
  
  for await (const chunk of stream) {
    buffer += chunk;
    
    // Yield complete thoughts/sentences
    const sentences = buffer.match(/[^.!?]+[.!?]+/g) || [];
    
    for (const sentence of sentences) {
      yield sentence;
      buffer = buffer.replace(sentence, '');
    }
  }
  
  // Yield any remaining buffer
  if (buffer.trim()) {
    yield buffer;
  }
}

// Client-side usage
for await (const chunk of streamResponse(request)) {
  appendToUI(chunk);
  updateTypingIndicator();
}`}
                  </pre>
                </div>
              </div>

              <div className="border-l-4 border-primary/50 pl-6">
                <h3 className="text-xl font-bold mb-3 font-mono">4.4 Multi-Modal Chat Support</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  Advanced SIMs support multi-modal interactions including images, voice, and structured data. The interface adapts 
                  response format based on input modality while maintaining consistent utility optimization:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="leading-relaxed">
                    <span className="font-bold text-foreground">Image Input:</span> Process visual data through vision models, 
                    extract relevant features, and incorporate into context for text-based responses or image generation.
                  </li>
                  <li className="leading-relaxed">
                    <span className="font-bold text-foreground">Voice Interface:</span> Transcribe speech to text, process through 
                    standard chat pipeline, and synthesize responses using text-to-speech aligned with agent identity.
                  </li>
                  <li className="leading-relaxed">
                    <span className="font-bold text-foreground">Structured Data:</span> Handle tables, charts, and formatted data 
                    inputs. Generate appropriate visual responses or structured outputs based on utility function preferences.
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Integration and Deployment */}
        <Card className="mb-8 border-border bg-card">
          <CardContent className="p-8">
            <h2 className="text-3xl font-bold mb-6 font-mono flex items-center gap-2">
              <Zap className="h-6 w-6" />
              5. Integration and Deployment
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Deploying a SIM requires integrating the three core subsystems (MCP servers, utility function, chat interface) with 
              supporting infrastructure for authentication, monitoring, and scaling. Production deployments must handle variable 
              load, maintain state consistency, and ensure security through social proof verification.
            </p>

            <div className="space-y-6">
              <div className="border-l-4 border-primary/50 pl-6">
                <h3 className="text-xl font-bold mb-3 font-mono">5.1 Social Proof Integration</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  X (Twitter) account verification establishes the agent's cryptographic identity through OAuth authentication. 
                  The verification process authenticates the user's X account directly through the X API, creating an immutable 
                  cryptographic binding between the AI agent and the operator's verified social identity:
                </p>
                <div className="bg-background/50 p-4 rounded-lg font-mono text-sm border border-border/30 overflow-x-auto">
                  <pre className="text-muted-foreground">
{`// Social proof verification workflow
1. User initiates agent creation and clicks "Create AI Agent"
2. System redirects to X OAuth authentication
3. User authorizes the application through X's OAuth flow
4. X API returns authenticated user credentials and profile data
5. Cryptographic binding created: agent_id ↔ x_account_id
6. Agent inherits reputation and social proof from X account
7. All agent actions attributable to verified X identity
8. No manual token posting required - fully automated via X API`}
                  </pre>
                </div>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  This OAuth-based approach provides seamless authentication without requiring users to manually post verification 
                  tokens. The X API handles all identity verification, ensuring secure and reliable cryptographic binding while 
                  maintaining excellent user experience. The agent's X account serves as its public identity and reputation source.
                </p>
              </div>

              <div className="border-l-4 border-primary/50 pl-6">
                <h3 className="text-xl font-bold mb-3 font-mono">5.2 Scaling and Performance</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  Production SIMs must handle concurrent users, maintain low latency, and scale efficiently. Architecture separates 
                  stateless components (MCP servers, utility computation) from stateful components (conversation management):
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="leading-relaxed">
                    <span className="font-bold text-foreground">Horizontal Scaling:</span> MCP servers and utility computation 
                    deployed as serverless functions. Each instance handles requests independently with no shared state.
                  </li>
                  <li className="leading-relaxed">
                    <span className="font-bold text-foreground">State Management:</span> Conversation state persisted in distributed 
                    database (Supabase). WebSocket connections maintained through sticky sessions for real-time chat.
                  </li>
                  <li className="leading-relaxed">
                    <span className="font-bold text-foreground">Caching Strategy:</span> MCP responses cached with TTL-based 
                    invalidation. Utility function results memoized for identical states. Language model responses cached for 
                    common queries.
                  </li>
                </ul>
              </div>

              <div className="border-l-4 border-primary/50 pl-6">
                <h3 className="text-xl font-bold mb-3 font-mono">5.3 Monitoring and Observability</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  Production monitoring tracks system health, utility function performance, and user satisfaction. Key metrics include:
                </p>
                <div className="bg-background/50 p-4 rounded-lg font-mono text-sm border border-border/30 overflow-x-auto">
                  <pre className="text-muted-foreground">
{`// Critical monitoring metrics
{
  "mcp_servers": {
    "latency_p95": "< 200ms",
    "error_rate": "< 0.1%",
    "cache_hit_ratio": "> 80%"
  },
  "utility_function": {
    "evaluation_time": "< 50ms",
    "objective_achievement": "> 0.85",
    "constraint_violations": "0"
  },
  "chat_interface": {
    "response_latency_p95": "< 2s",
    "streaming_latency": "< 100ms/token",
    "user_satisfaction": "> 4.2/5"
  },
  "cryptocurrency_earnings": {
    "tokens_earned": "real-time",
    "transaction_success_rate": "> 99.9%"
  }
}`}
                  </pre>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Getting Started */}
        {!showBetaRequest ? (
          <Card className="mb-8 border-border bg-card">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold mb-6 font-mono flex items-center gap-2">
                <Terminal className="h-6 w-6" />
                6. Getting Started
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                To create your first SIM, connect your X account through OAuth authentication. The platform provides templates for 
                common utility functions and pre-configured MCP servers for popular integrations. Your SIM will inherit the reputation 
                and social proof of your X account, establishing immediate trust with users.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                The agent creation wizard guides you through defining your utility function, selecting MCP integrations, and 
                configuring the chat interface. Once deployed, your SIM operates autonomously, optimizing against your defined 
                objectives while earning $SIMAI cryptocurrency rewards based on usage and performance.
              </p>
              <div>
                <Button onClick={handleCreateAgent} size="lg" className="bg-white/10 backdrop-blur-md border border-white/20 text-foreground hover:bg-white/20 text-xl px-8 py-6 gap-3 h-auto font-mono">
                  Create AI Agent <img src={xIcon} alt="X" className="h-6 w-6 inline-block" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8 border-border bg-card">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold text-foreground mb-6 text-center font-mono">Your X account isn't on the early access list</h2>
              <p className="text-muted-foreground mb-6 text-center">Post this on X to get an early access invite:</p>
              <div className="p-4 bg-background/50 rounded-lg font-mono text-sm text-foreground mb-6 text-center border border-border">
                $SIMAI
              </div>
              <div className="space-y-3">
                <Button onClick={handlePostToX} className="w-full" size="lg">
                  Post on X
                </Button>
                <Button variant="outline" onClick={() => setShowBetaRequest(false)} className="w-full">
                  Back
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer Reference */}
        <div className="text-center text-sm text-muted-foreground font-mono mt-12 mb-8">
          <p>SIM Technical Documentation v1.0</p>
          <p className="mt-2">For support and updates, visit the SIM platform or join the developer community.</p>
        </div>
      </div>

      <SimpleFooter />
    </div>
  );
}
