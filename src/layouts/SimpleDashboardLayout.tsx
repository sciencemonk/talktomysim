
import { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Plus, MessageSquare, Settings, CreditCard } from "lucide-react";

interface SimpleDashboardLayoutProps {
  children: ReactNode;
}

const SimpleDashboardLayout = ({ children }: SimpleDashboardLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: "/dashboard", label: "Tutors", icon: MessageSquare },
    { path: "/create-tutor", label: "Create", icon: Plus },
    { path: "/settings", label: "Settings", icon: Settings },
    { path: "/billing", label: "Billing", icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-bg">
      {/* Simplified top bar */}
      <header className="border-b border-border/50 bg-bg/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-fg">AI Tutor</h1>
          
          <nav className="flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Button
                  key={item.path}
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(item.path)}
                  className={`text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "text-fgMuted hover:text-fg hover:bg-bgMuted"
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Button>
              );
            })}
            <div className="ml-4 pl-4 border-l border-border/50">
              <ThemeToggle />
            </div>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
};

export default SimpleDashboardLayout;
