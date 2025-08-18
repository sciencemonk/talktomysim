
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UserSettingsDropdown } from "@/components/UserSettingsDropdown";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Home, Users, BookOpen, Settings, TrendingUp, GraduationCap } from "lucide-react";

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: "Dashboard", path: "/dashboard" },
    { icon: Users, label: "My Tutors", path: "/agents" },
    { icon: TrendingUp, label: "Marketplace", path: "/marketplace" },
    { icon: GraduationCap, label: "Professional Development", path: "/professional-development" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-shrink-0">
              <div className="p-1 sm:p-2 rounded-lg flex items-center justify-center flex-shrink-0">
                <img 
                  src="/lovable-uploads/1a618b3c-11e7-43e4-a2d5-c1e6f36e48ba.png" 
                  alt="Think With Me Logo" 
                  className="h-8 w-8 sm:h-10 sm:w-10"
                />
              </div>
              <div className="flex-shrink-0">
                <h1 className="text-lg sm:text-xl font-bold text-foreground">
                  <span className="font-extrabold text-blue-600">T</span>hink{" "}
                  <span className="font-extrabold text-blue-600">W</span>ith{" "}
                  <span className="font-extrabold text-blue-600">M</span>e
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">Thinking Partners for Classrooms</p>
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="hidden lg:flex items-center space-x-6">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.path}
                    variant={isActive(item.path) ? "default" : "ghost"}
                    size="sm"
                    onClick={() => navigate(item.path)}
                    className="flex items-center gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                );
              })}
            </nav>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <UserSettingsDropdown />
            </div>
          </div>

          {/* Mobile Navigation */}
          <nav className="lg:hidden mt-4 flex flex-wrap gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.path}
                  variant={isActive(item.path) ? "default" : "ghost"}
                  size="sm"
                  onClick={() => navigate(item.path)}
                  className="flex items-center gap-2 text-xs"
                >
                  <Icon className="h-3 w-3" />
                  {item.label}
                </Button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-4 mt-auto">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-1 rounded-lg flex items-center justify-center">
                <img 
                  src="/lovable-uploads/1a618b3c-11e7-43e4-a2d5-c1e6f36e48ba.png" 
                  alt="Think With Me Logo" 
                  className="h-6 w-6"
                />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  <span className="font-extrabold text-blue-600">T</span>hink{" "}
                  <span className="font-extrabold text-blue-600">W</span>ith{" "}
                  <span className="font-extrabold text-blue-600">M</span>e
                </h3>
                <p className="text-xs text-muted-foreground">Empowering educators with AI</p>
              </div>
            </div>
            <div className="text-xs text-muted-foreground text-center">
              © 2024 Think With Me. Built for educators, by educators.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DashboardLayout;
