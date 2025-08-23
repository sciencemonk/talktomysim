
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActionsNavItemProps {
  agentId: string;
}

export const ActionsNavItem = ({ agentId }: ActionsNavItemProps) => {
  const location = useLocation();
  const isActive = location.pathname.includes('/actions');

  return (
    <Link
      to={`/agents/${agentId}/actions`}
      className={cn(
        "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      )}
    >
      <Shield className="h-4 w-4" />
      Actions
    </Link>
  );
};
