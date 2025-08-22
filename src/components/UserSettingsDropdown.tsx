
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
import { Settings, LogOut, User, Home, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import UpgradeModal from "./UpgradeModal";

interface UserSettingsDropdownProps {
  onShowBilling?: () => void;
  trigger?: React.ReactNode;
  simplified?: boolean; // New prop to control which items to show
}

const UserSettingsDropdown = ({ onShowBilling, trigger, simplified = false }: UserSettingsDropdownProps) => {
  const { user, signOut } = useAuth();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  const defaultTrigger = (
    <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full">
      <Avatar className="h-8 w-8">
        <AvatarImage src={user?.user_metadata?.avatar_url} alt="Profile" />
        <AvatarFallback>
          {user?.email?.charAt(0)?.toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>
    </Button>
  );

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {trigger || defaultTrigger}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          {!simplified && (
            <>
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
              <DropdownMenuItem asChild>
                <Link to="/settings" className="w-full flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuItem onClick={() => setShowUpgradeModal(true)}>
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Upgrade</span>
          </DropdownMenuItem>
          {!simplified && <DropdownMenuSeparator />}
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <UpgradeModal 
        open={showUpgradeModal} 
        onOpenChange={setShowUpgradeModal} 
      />
    </>
  );
};

export default UserSettingsDropdown;
