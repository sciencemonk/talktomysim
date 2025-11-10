import { useEffect, useRef, useState } from 'react';

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
}

interface Connection {
  from: string;
  to: string;
  strength: number;
}

export const GodModeMap = ({ agentName }: { agentName: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
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
        isMainAgent: true
      },
      ...Array.from({ length: 150 }, (_, i) => ({
        id: `agent-${i}`,
        name: `Agent ${i + 1}`,
        x: Math.random() * 760 + 20,
        y: Math.random() * 560 + 20,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        radius: 3,
        color: i % 3 === 0 ? '#60a5fa' : i % 3 === 1 ? '#a78bfa' : '#f472b6',
        isMainAgent: false
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
      // Clear canvas
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid
      ctx.strokeStyle = 'rgba(131, 241, 170, 0.1)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

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

        // Draw connections
        connections.forEach(conn => {
          const fromAgent = updatedAgents.find(a => a.id === conn.from);
          const toAgent = updatedAgents.find(a => a.id === conn.to);
          
          if (fromAgent && toAgent) {
            ctx.strokeStyle = `rgba(131, 241, 170, ${conn.strength * 0.4})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(fromAgent.x, fromAgent.y);
            ctx.lineTo(toAgent.x, toAgent.y);
            ctx.stroke();

            // Draw connection pulse
            const gradient = ctx.createLinearGradient(fromAgent.x, fromAgent.y, toAgent.x, toAgent.y);
            gradient.addColorStop(0, `rgba(131, 241, 170, ${conn.strength})`);
            gradient.addColorStop(1, 'rgba(131, 241, 170, 0)');
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });

        // Draw agents
        updatedAgents.forEach(agent => {
          // Outer glow for main agent
          if (agent.isMainAgent) {
            ctx.shadowBlur = 20;
            ctx.shadowColor = agent.color;
          } else {
            ctx.shadowBlur = 10;
            ctx.shadowColor = agent.color;
          }

          // Draw agent circle
          ctx.fillStyle = agent.color;
          ctx.beginPath();
          ctx.arc(agent.x, agent.y, agent.radius, 0, Math.PI * 2);
          ctx.fill();

          // Draw pulsing ring for main agent
          if (agent.isMainAgent) {
            const pulseRadius = agent.radius + Math.sin(Date.now() / 500) * 3 + 5;
            ctx.strokeStyle = `rgba(131, 241, 170, ${0.5 - (pulseRadius - agent.radius) / 20})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(agent.x, agent.y, pulseRadius, 0, Math.PI * 2);
            ctx.stroke();
          }

          ctx.shadowBlur = 0;

          // Draw agent label for main agent
          if (agent.isMainAgent) {
            ctx.fillStyle = '#ffffff';
            ctx.font = '10px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(agent.name, agent.x, agent.y - agent.radius - 8);
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
  }, [connections]);

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-background via-background/95 to-primary/5 rounded-lg border border-primary/20 overflow-hidden min-h-[600px]">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="w-full h-full"
      />
      <div className="absolute bottom-2 right-2 text-[10px] font-mono text-muted-foreground bg-background/80 px-2 py-1 rounded">
        {agents.filter(a => !a.isMainAgent).length} agents online • {connections.length} active interactions
      </div>
    </div>
  );
};
