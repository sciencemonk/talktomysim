
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, CreditCard, User, Moon, Sun, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { useTheme } from "@/hooks/useTheme";

export function UserSettingsDropdown() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [creditsLeft] = useState(75); // Mock data - replace with actual credits
  const totalCredits = 100; // Default free credits
  const creditsUsed = totalCredits - creditsLeft;
  const progressPercentage = (creditsUsed / totalCredits) * 100;

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleBillingClick = () => {
    navigate("/billing");
  };

  const handleSettingsClick = () => {
    navigate("/settings");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Settings className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        <DropdownMenuLabel className="font-medium">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Credits: {creditsLeft}/{totalCredits}
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={toggleTheme} className="cursor-pointer">
          {theme === "dark" ? (
            <Sun className="h-4 w-4 mr-2" />
          ) : (
            <Moon className="h-4 w-4 mr-2" />
          )}
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleBillingClick} className="cursor-pointer">
          <DollarSign className="h-4 w-4 mr-2" />
          Billing
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleSettingsClick} className="cursor-pointer">
          <User className="h-4 w-4 mr-2" />
          Settings
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
