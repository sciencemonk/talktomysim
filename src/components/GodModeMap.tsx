import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { ExternalLink, Coins, TrendingUp } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

interface Agent {
  id: string;
  name: string;
  lng: number;
  lat: number;
  radius: number;
  color: string;
  isMainAgent: boolean;
  customUrl?: string;
  simaiBalance?: number;
  avatarUrl?: string;
}

interface Connection {
  from: string;
  to: string;
  strength: number;
}

// Mapbox public token
mapboxgl.accessToken = 'pk.eyJ1IjoibWljaGFlbGFvIiwiYSI6ImNtNTE1dDhuMzFzemYycXEzbGZqNXRnM2kifQ.MLtu0XCi-r56Whozb0VXgw';

export const GodModeMap = ({ agentName }: { agentName: string }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [popoverPosition, setPopoverPosition] = useState<{ x: number; y: number } | null>(null);
  const [agentCount, setAgentCount] = useState(0);
  const [connectionCount, setConnectionCount] = useState(0);
  const { theme } = useTheme();
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');
  const agentsRef = useRef<Agent[]>([]);
  const connectionsRef = useRef<Connection[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setResolvedTheme(isDark ? 'dark' : 'light');
    } else {
      setResolvedTheme(theme as 'light' | 'dark');
    }
  }, [theme]);

  useEffect(() => {
    // Major world cities coordinates for SIM locations
    const worldLocations = [
      { lng: -74.006, lat: 40.7128 }, // New York
      { lng: -118.2437, lat: 34.0522 }, // Los Angeles
      { lng: -0.1276, lat: 51.5074 }, // London
      { lng: 2.3522, lat: 48.8566 }, // Paris
      { lng: 139.6917, lat: 35.6762 }, // Tokyo
      { lng: 121.4737, lat: 31.2304 }, // Shanghai
      { lng: 77.2090, lat: 28.6139 }, // Delhi
      { lng: -43.1729, lat: -22.9068 }, // Rio
      { lng: 151.2093, lat: -33.8688 }, // Sydney
      { lng: 18.4241, lat: -33.9249 }, // Cape Town
      { lng: 55.2708, lat: 25.2048 }, // Dubai
      { lng: 103.8198, lat: 1.3521 }, // Singapore
      { lng: -99.1332, lat: 19.4326 }, // Mexico City
      { lng: 37.6173, lat: 55.7558 }, // Moscow
      { lng: 12.4964, lat: 41.9028 }, // Rome
    ];

    // Mock SIM names for variety
    const mockNames = [
      'CryptoDiviX', 'DegenCapital', 'ProfessrWeb3', 'AI Trader', 'Smart Agent',
      'Digital Twin', 'Blockchain Bot', 'Crypto Sage', 'Web3 Wizard', 'Token Master',
      'NFT Guru', 'DeFi King', 'Metaverse Maven', 'Solana Slayer', 'ETH Enjoyer'
    ];

    // Mock avatar URLs
    const mockAvatars = [
      '/lovable-uploads/1a618b3c-11e7-43e4-a2d5-c1e6f36e48ba.png',
      '/lovable-uploads/1bcbaef9-d3ee-43db-88b5-00437f50935e.png',
      '/lovable-uploads/29ef3bcb-9544-4a2c-bfbd-57ce889d1989.png',
      '/lovable-uploads/31a26b17-27fc-463a-9eb2-a5e764de804e.png',
      '/lovable-uploads/35810899-a91c-4acc-b8e9-c0868e320e3f.png',
    ];

    // Initialize agents at world locations
    const initialAgents: Agent[] = [
      {
        id: 'main',
        name: agentName,
        lng: -74.006,
        lat: 40.7128,
        radius: 12,
        color: '#83f1aa',
        isMainAgent: true,
        customUrl: 'testuser',
        simaiBalance: 125430,
        avatarUrl: mockAvatars[0]
      },
      ...Array.from({ length: 150 }, (_, i) => {
        const location = worldLocations[i % worldLocations.length];
        // Add some random offset to spread agents around cities
        const lngOffset = (Math.random() - 0.5) * 10;
        const latOffset = (Math.random() - 0.5) * 10;
        
        return {
          id: `agent-${i}`,
          name: mockNames[i % mockNames.length] + (i > 14 ? ` ${Math.floor(i / 15)}` : ''),
          lng: location.lng + lngOffset,
          lat: location.lat + latOffset,
          radius: 8,
          color: i % 3 === 0 ? '#60a5fa' : i % 3 === 1 ? '#a78bfa' : '#f472b6',
          isMainAgent: false,
          customUrl: `agent-${i}`,
          simaiBalance: Math.floor(Math.random() * 100000) + 1000,
          avatarUrl: mockAvatars[i % mockAvatars.length]
        };
      })
    ];
    agentsRef.current = initialAgents;
    setAgentCount(initialAgents.length);

    // Start with no connections
    connectionsRef.current = [];

    // Randomly create temporary interactions between nearby agents
    const connectionInterval = setInterval(() => {
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
      
      connectionsRef.current = newConnections;
      setConnectionCount(newConnections.length);
      
      // Update connection lines on map
      if (map.current && map.current.getSource('connections')) {
        const lineFeatures = newConnections.map(conn => {
          const fromAgent = agentsRef.current.find(a => a.id === conn.from);
          const toAgent = agentsRef.current.find(a => a.id === conn.to);
          
          if (fromAgent && toAgent) {
            return {
              type: 'Feature' as const,
              properties: { strength: conn.strength },
              geometry: {
                type: 'LineString' as const,
                coordinates: [
                  [fromAgent.lng, fromAgent.lat],
                  [toAgent.lng, toAgent.lat]
                ]
              }
            };
          }
          return null;
        }).filter(Boolean);

        (map.current.getSource('connections') as mapboxgl.GeoJSONSource).setData({
          type: 'FeatureCollection',
          features: lineFeatures as any[]
        });
      }
    }, 3000);

    return () => clearInterval(connectionInterval);
  }, [agentName]);

  // Initialize Mapbox map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: resolvedTheme === 'dark' ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/light-v11',
      center: [0, 20],
      zoom: 1.5,
      projection: 'globe' as any,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.scrollZoom.enable();

    map.current.on('load', () => {
      if (!map.current) return;

      // Add atmosphere
      map.current.setFog({
        color: resolvedTheme === 'dark' ? 'rgb(20, 20, 30)' : 'rgb(255, 255, 255)',
        'high-color': resolvedTheme === 'dark' ? 'rgb(40, 40, 60)' : 'rgb(200, 200, 225)',
        'horizon-blend': 0.2,
      });

      // Add connection lines layer
      map.current.addSource('connections', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });

      map.current.addLayer({
        id: 'connections',
        type: 'line',
        source: 'connections',
        paint: {
          'line-color': '#83f1aa',
          'line-width': 2,
          'line-opacity': ['get', 'strength']
        }
      });

      // Add markers for each agent
      agentsRef.current.forEach(agent => {
        if (!map.current) return;
        
        const el = document.createElement('div');
        el.className = 'agent-marker';
        el.style.width = `${agent.radius * 2}px`;
        el.style.height = `${agent.radius * 2}px`;
        el.style.borderRadius = '50%';
        el.style.border = agent.isMainAgent ? '3px solid #83f1aa' : '2px solid ' + agent.color;
        el.style.backgroundColor = agent.color;
        el.style.boxShadow = agent.isMainAgent ? '0 0 20px rgba(131, 241, 170, 0.8)' : '0 0 10px rgba(0,0,0,0.3)';
        el.style.cursor = 'pointer';
        el.style.backgroundImage = agent.avatarUrl ? `url(${agent.avatarUrl})` : 'none';
        el.style.backgroundSize = 'cover';
        el.style.backgroundPosition = 'center';
        
        if (agent.isMainAgent) {
          el.style.animation = 'pulse 2s infinite';
        }

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          setSelectedAgent(agent);
          if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setPopoverPosition({
              x: (e as any).clientX - rect.left,
              y: (e as any).clientY - rect.top
            });
          }
        });

        const marker = new mapboxgl.Marker(el)
          .setLngLat([agent.lng, agent.lat])
          .addTo(map.current);

        markers.current.set(agent.id, marker);
      });
    });

    return () => {
      markers.current.forEach(marker => marker.remove());
      markers.current.clear();
      map.current?.remove();
      map.current = null;
    };
  }, [resolvedTheme]);

  // Update map style when theme changes
  useEffect(() => {
    if (map.current) {
      const style = resolvedTheme === 'dark' ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/light-v11';
      map.current.setStyle(style);
    }
  }, [resolvedTheme]);

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
      className="relative w-full h-full rounded-lg overflow-hidden"
    >
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
      
      <div ref={mapContainer} className="absolute inset-0" />
      
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
        {agentCount - 1} agents online • {connectionCount} active interactions
      </div>
    </div>
  );
};
