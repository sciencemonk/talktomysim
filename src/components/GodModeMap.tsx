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
    // Initialize agents
    const initialAgents: Agent[] = [
      {
        id: 'main',
        name: agentName,
        x: 150,
        y: 100,
        vx: 0.5,
        vy: 0.3,
        radius: 8,
        color: '#83f1aa',
        isMainAgent: true
      },
      ...Array.from({ length: 8 }, (_, i) => ({
        id: `agent-${i}`,
        name: `Agent ${i + 1}`,
        x: Math.random() * 280 + 10,
        y: Math.random() * 180 + 10,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: 5,
        color: i % 2 === 0 ? '#60a5fa' : '#a78bfa',
        isMainAgent: false
      }))
    ];
    setAgents(initialAgents);

    // Create initial connections
    const initialConnections: Connection[] = [
      { from: 'main', to: 'agent-0', strength: 0.8 },
      { from: 'main', to: 'agent-3', strength: 0.6 }
    ];
    setConnections(initialConnections);

    // Randomly update connections
    const connectionInterval = setInterval(() => {
      const randomAgent = `agent-${Math.floor(Math.random() * 8)}`;
      setConnections(prev => {
        const existing = prev.find(c => c.to === randomAgent);
        if (existing) {
          return prev.filter(c => c.to !== randomAgent);
        } else {
          return [...prev.slice(-3), { from: 'main', to: randomAgent, strength: Math.random() * 0.5 + 0.5 }];
        }
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
    <div className="relative w-full h-[220px] bg-gradient-to-br from-background via-background/95 to-primary/5 rounded-lg border border-primary/20 overflow-hidden">
      <canvas
        ref={canvasRef}
        width={300}
        height={220}
        className="w-full h-full"
      />
      <div className="absolute bottom-2 right-2 text-[10px] font-mono text-muted-foreground bg-background/80 px-2 py-1 rounded">
        {agents.filter(a => !a.isMainAgent).length} agents online
      </div>
    </div>
  );
};
