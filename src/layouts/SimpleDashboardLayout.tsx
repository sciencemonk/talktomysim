
import { useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Plus, MessageSquare, Settings, CreditCard, Menu, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const SimpleDashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: "/dashboard", label: "Tutors", icon: MessageSquare },
    { path: "/create-tutor", label: "Create", icon: Plus },
    { path: "/settings", label: "Settings", icon: Settings },
    { path: "/billing", label: "Billing", icon: CreditCard },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-bg">
      {/* Desktop and Mobile Header */}
      <header className="border-b border-border/50 bg-bg/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-fg">AI Tutor</h1>
          
          {/* Desktop Navigation */}
          {!isMobile && (
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
          )}

          {/* Mobile Menu Button and Theme Toggle */}
          {isMobile && (
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobile && mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-bg/95 backdrop-blur-xl border-b border-border/50 shadow-lg">
            <nav className="max-w-7xl mx-auto px-4 py-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Button
                    key={item.path}
                    variant="ghost"
                    size="lg"
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full justify-start text-base font-medium transition-all duration-200 ${
                      isActive 
                        ? "bg-primary text-primary-foreground" 
                        : "text-fgMuted hover:text-fg hover:bg-bgMuted"
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </Button>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default SimpleDashboardLayout;
