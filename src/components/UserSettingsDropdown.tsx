
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth";
import { Settings, LogOut, User, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface UserSettingsDropdownProps {
  onShowBilling?: () => void;
  onShowSettings?: () => void;
  collapsed?: boolean;
  trigger?: React.ReactNode;
}

const UserSettingsDropdown = ({ onShowBilling, onShowSettings, collapsed, trigger }: UserSettingsDropdownProps) => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  const defaultTrigger = (
    <Button 
      variant="ghost" 
      className={cn(
        "h-auto p-2",
        collapsed ? "w-full justify-center" : "w-full justify-start gap-2"
      )}
    >
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={user?.user_metadata?.avatar_url} alt="Profile" />
        <AvatarFallback>
          {user?.email?.charAt(0)?.toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>
      {!collapsed && (
        <div className="flex-1 min-w-0 text-left">
          <div className="font-medium text-sm truncate">
            {user?.user_metadata?.full_name || "User"}
          </div>
          <div className="text-xs text-muted-foreground truncate">
            {user?.email}
          </div>
        </div>
      )}
    </Button>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger || defaultTrigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user?.user_metadata?.full_name || "User"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
            {onShowBilling && (
              <button
                onClick={onShowBilling}
                className="text-xs text-primary hover:text-primary/80 underline font-medium text-left mt-1"
              >
                0.0 hours left
              </button>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/agents" className="w-full flex items-center">
            <Home className="mr-2 h-4 w-4" />
            <span>Home</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/child-profile" className="w-full flex items-center">
            <User className="mr-2 h-4 w-4" />
            <span>Child Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={onShowSettings}
          className="w-full flex items-center cursor-pointer"
        >
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserSettingsDropdown;
