
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  User, 
  Settings, 
  LogOut, 
  Bot, 
  PlusCircle,
  CreditCard
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface UserSidebarProps {
  onShowBilling?: () => void;
}

const UserSidebar = ({ onShowBilling }: UserSidebarProps) => {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
  };

  const isActive = (path: string) => location.pathname === path;

  const navigationItems = [
    { title: "Home", url: "/agents", icon: Home },
    { title: "Child Profile", url: "/child-profile", icon: User },
    { title: "Settings", url: "/settings", icon: Settings },
  ];

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col h-screen">
      {/* Logo */}
      <div className="p-4 flex items-center gap-3">
        <img 
          src="/lovable-uploads/55ccce33-98a1-45d2-9e9e-7b446a02a417.png" 
          alt="Think With Me" 
          className="h-8 w-8"
        />
        <h1 className="font-semibold text-lg">Think With Me</h1>
      </div>

      <Separator />

      {/* Navigation Items */}
      <div className="flex-1 p-3 space-y-1">
        {navigationItems.map((item) => (
          <Link
            key={item.title}
            to={item.url}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
              isActive(item.url)
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.title}
          </Link>
        ))}

        <Separator className="my-3" />

        {/* Quick Actions */}
        <Link
          to="/agents/create"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <PlusCircle className="h-4 w-4" />
          Create Agent
        </Link>

        <Link
          to="/agents"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Bot className="h-4 w-4" />
          My Agents
        </Link>
      </div>

      <Separator />

      {/* User Profile Section */}
      <div className="p-3 space-y-2">
        {/* Usage/Billing Info */}
        {onShowBilling && (
          <button
            onClick={onShowBilling}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-muted-foreground hover:bg-muted hover:text-foreground w-full text-left"
          >
            <CreditCard className="h-4 w-4" />
            <div className="flex flex-col">
              <span className="text-xs">Usage</span>
              <span className="text-primary font-medium">0.0 hours left</span>
            </div>
          </button>
        )}

        {/* User Info */}
        <div className="flex items-center gap-3 px-3 py-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.user_metadata?.avatar_url} alt="Profile" />
            <AvatarFallback>
              {user?.email?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user?.user_metadata?.full_name || "User"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
        </div>

        {/* Logout Button */}
        <Button
          onClick={handleSignOut}
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </Button>
      </div>
    </div>
  );
};

export default UserSidebar;
