import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { ExternalLink, Coins, TrendingUp } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

interface Agent {
  id: string;
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  isMainAgent: boolean;
  customUrl?: string;
  simaiBalance?: number;
}

interface Connection {
  from: string;
  to: string;
  strength: number;
}

export const GodModeMap = ({ agentName }: { agentName: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [popoverPosition, setPopoverPosition] = useState<{ x: number; y: number } | null>(null);
  const animationFrameRef = useRef<number>();
  const { theme } = useTheme();
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setResolvedTheme(isDark ? 'dark' : 'light');
    } else {
      setResolvedTheme(theme as 'light' | 'dark');
    }
  }, [theme]);

  useEffect(() => {
    // Mock SIM names for variety
    const mockNames = [
      'CryptoDiviX', 'DegenCapital', 'ProfessrWeb3', 'AI Trader', 'Smart Agent',
      'Digital Twin', 'Blockchain Bot', 'Crypto Sage', 'Web3 Wizard', 'Token Master',
      'NFT Guru', 'DeFi King', 'Metaverse Maven', 'Solana Slayer', 'ETH Enjoyer'
    ];

    // Initialize agents with much slower speeds and wider distribution
    const initialAgents: Agent[] = [
      {
        id: 'main',
        name: agentName,
        x: 400,
        y: 300,
        vx: 0.08,
        vy: 0.05,
        radius: 4,
        color: '#83f1aa',
        isMainAgent: true,
        customUrl: 'testuser',
        simaiBalance: 125430
      },
      ...Array.from({ length: 150 }, (_, i) => ({
        id: `agent-${i}`,
        name: mockNames[i % mockNames.length] + (i > 14 ? ` ${Math.floor(i / 15)}` : ''),
        x: Math.random() * 760 + 20,
        y: Math.random() * 560 + 20,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        radius: 3,
        color: i % 3 === 0 ? '#60a5fa' : i % 3 === 1 ? '#a78bfa' : '#f472b6',
        isMainAgent: false,
        customUrl: `agent-${i}`,
        simaiBalance: Math.floor(Math.random() * 100000) + 1000
      }))
    ];
    setAgents(initialAgents);

    // Start with no connections
    setConnections([]);

    // Randomly create temporary interactions between nearby agents
    const connectionInterval = setInterval(() => {
      setConnections(prev => {
        // Remove old connections (they last only 3 seconds)
        const newConnections: Connection[] = [];
        
        // Randomly create 2-5 new interactions
        const numNewConnections = Math.floor(Math.random() * 4) + 2;
        for (let i = 0; i < numNewConnections; i++) {
          const agent1 = Math.random() < 0.3 ? 'main' : `agent-${Math.floor(Math.random() * 150)}`;
          const agent2 = `agent-${Math.floor(Math.random() * 150)}`;
          if (agent1 !== agent2) {
            newConnections.push({
              from: agent1,
              to: agent2,
              strength: Math.random() * 0.4 + 0.4
            });
          }
        }
        
        return newConnections;
      });
    }, 3000);

    return () => clearInterval(connectionInterval);
  }, [agentName]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      // Clear canvas with theme-aware solid background
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = resolvedTheme === 'dark' ? '#000000' : '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw agents
      setAgents(prevAgents => {
        const updatedAgents = prevAgents.map(agent => {
          let { x, y, vx, vy } = agent;

          // Update position
          x += vx;
          y += vy;

          // Bounce off edges
          if (x <= agent.radius || x >= canvas.width - agent.radius) {
            vx *= -1;
            x = Math.max(agent.radius, Math.min(canvas.width - agent.radius, x));
          }
          if (y <= agent.radius || y >= canvas.height - agent.radius) {
            vy *= -1;
            y = Math.max(agent.radius, Math.min(canvas.height - agent.radius, y));
          }

          return { ...agent, x, y, vx, vy };
        });

        // Draw connections FIRST (so they appear behind agents)
        connections.forEach(conn => {
          const fromAgent = updatedAgents.find(a => a.id === conn.from);
          const toAgent = updatedAgents.find(a => a.id === conn.to);
          
          if (fromAgent && toAgent) {
            // Main connection line
            ctx.strokeStyle = `rgba(131, 241, 170, ${conn.strength * 0.3})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(fromAgent.x, fromAgent.y);
            ctx.lineTo(toAgent.x, toAgent.y);
            ctx.stroke();

            // Gradient pulse effect
            const gradient = ctx.createLinearGradient(fromAgent.x, fromAgent.y, toAgent.x, toAgent.y);
            gradient.addColorStop(0, `rgba(131, 241, 170, ${conn.strength * 0.5})`);
            gradient.addColorStop(1, 'rgba(131, 241, 170, 0)');
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });

        // Draw agents ON TOP of connections
        updatedAgents.forEach(agent => {
          // Reset shadow for each agent
          ctx.shadowBlur = 0;
          ctx.shadowColor = 'transparent';

          // Outer glow for main agent
          if (agent.isMainAgent) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = agent.color;
          } else {
            ctx.shadowBlur = 8;
            ctx.shadowColor = agent.color;
          }

          // Draw agent circle
          ctx.fillStyle = agent.color;
          ctx.beginPath();
          ctx.arc(agent.x, agent.y, agent.radius, 0, Math.PI * 2);
          ctx.fill();

          // Reset shadow before drawing ring
          ctx.shadowBlur = 0;
          ctx.shadowColor = 'transparent';

          // Draw pulsing ring for main agent
          if (agent.isMainAgent) {
            const pulseRadius = agent.radius + Math.sin(Date.now() / 500) * 2 + 4;
            ctx.strokeStyle = `rgba(131, 241, 170, ${0.6 - (pulseRadius - agent.radius) / 15})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(agent.x, agent.y, pulseRadius, 0, Math.PI * 2);
            ctx.stroke();
          }

          // Draw agent label for main agent (make it theme-aware)
          if (agent.isMainAgent) {
            ctx.fillStyle = resolvedTheme === 'dark' ? '#ffffff' : '#000000';
            ctx.font = '10px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(agent.name, agent.x, agent.y - agent.radius - 10);
          }
        });

        return updatedAgents;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [connections, resolvedTheme]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // Find clicked agent
    const clickedAgent = agents.find(agent => {
      const dx = clickX - agent.x;
      const dy = clickY - agent.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance <= agent.radius + 5; // Add some extra click tolerance
    });

    if (clickedAgent) {
      setSelectedAgent(clickedAgent);
      // Position popover near the click
      setPopoverPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    } else {
      setSelectedAgent(null);
      setPopoverPosition(null);
    }
  };

  const formatBalance = (balance: number) => {
    if (balance >= 1000000) {
      return `${(balance / 1000000).toFixed(2)}M`;
    } else if (balance >= 1000) {
      return `${(balance / 1000).toFixed(1)}K`;
    }
    return balance.toLocaleString();
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full rounded-lg border border-border overflow-hidden min-h-[600px]"
      style={{ backgroundColor: resolvedTheme === 'dark' ? '#000000' : '#ffffff' }}
    >
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="w-full h-full cursor-pointer"
        onClick={handleCanvasClick}
      />
      
      {/* Agent Info Popover */}
      {selectedAgent && popoverPosition && (
        <div 
          className="absolute z-10"
          style={{
            left: `${Math.min(popoverPosition.x, containerRef.current?.clientWidth ? containerRef.current.clientWidth - 250 : popoverPosition.x)}px`,
            top: `${Math.max(10, Math.min(popoverPosition.y - 100, containerRef.current?.clientHeight ? containerRef.current.clientHeight - 200 : popoverPosition.y))}px`
          }}
        >
          <Card className="w-[240px] shadow-lg border-2 border-primary/30">
            <CardContent className="p-4 space-y-3">
              {/* Close button */}
              <button
                onClick={() => {
                  setSelectedAgent(null);
                  setPopoverPosition(null);
                }}
                className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>

              {/* Agent Info */}
              <div>
                <h3 className="font-bold text-lg mb-1 pr-6">{selectedAgent.name}</h3>
                {selectedAgent.isMainAgent && (
                  <div className="inline-block px-2 py-0.5 bg-primary/20 text-primary text-xs rounded-full mb-2">
                    Your SIM
                  </div>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Balance:</span>
                  <span className="font-semibold">{formatBalance(selectedAgent.simaiBalance || 0)} $SIMAI</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-semibold text-green-500">Active</span>
                </div>
              </div>

              {/* View Public Page Button */}
              {selectedAgent.customUrl && (
                <Button
                  size="sm"
                  className="w-full gap-2"
                  onClick={() => window.open(`/${selectedAgent.customUrl}`, '_blank')}
                >
                  View Public Page
                  <ExternalLink className="h-3 w-3" />
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <div className="absolute bottom-2 right-2 text-[10px] font-mono text-muted-foreground bg-background/80 px-2 py-1 rounded">
        {agents.filter(a => !a.isMainAgent).length} agents online • {connections.length} active interactions
      </div>
    </div>
  );
};
