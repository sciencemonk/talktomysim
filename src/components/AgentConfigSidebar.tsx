
import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { 
  Settings, 
  BarChart3, 
  MessageSquare, 
  Share2, 
  Shield,
  ChevronLeft 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const AgentConfigSidebar = () => {
  const location = useLocation();
  const { agentId } = useParams();

  const navigationItems = [
    {
      href: `/agents/${agentId}`,
      icon: Settings,
      label: 'Configuration',
      match: (path: string) => path === `/agents/${agentId}` || path.includes('/config')
    },
    {
      href: `/agents/${agentId}/actions`,
      icon: Shield,
      label: 'Actions',
      match: (path: string) => path.includes('/actions')
    },
    {
      href: `/agents/${agentId}/analytics`,
      icon: BarChart3,
      label: 'Analytics',
      match: (path: string) => path.includes('/analytics')
    },
    {
      href: `/agents/${agentId}/conversations`,
      icon: MessageSquare,
      label: 'Conversations',
      match: (path: string) => path.includes('/conversations')
    }
  ];

  return (
    <div className="w-64 bg-background border-r border-border h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <Link 
          to="/"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-6">
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const isActive = item.match(location.pathname);
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-6 border-t border-border">
        <Button variant="outline" size="sm" className="w-full">
          <Share2 className="h-4 w-4 mr-2" />
          Share Agent
        </Button>
      </div>
    </div>
  );
};

export default AgentConfigSidebar;
