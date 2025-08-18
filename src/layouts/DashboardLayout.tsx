
import { Link, useLocation } from "react-router-dom";
import { UserSettingsDropdown } from "@/components/UserSettingsDropdown";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import ProtectedRoute from "@/components/ProtectedRoute";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex w-full bg-gray-50 dark:bg-gray-900 flex-col">
        <main className="flex-1 flex flex-col">
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between max-w-7xl mx-auto w-full">
              <div className="flex items-center space-x-12">
                <div className="flex items-center space-x-3 flex-shrink-0">
                  <div className="p-2 rounded-lg flex items-center justify-center">
                    <img 
                      src="/lovable-uploads/1a618b3c-11e7-43e4-a2d5-c1e6f36e48ba.png" 
                      alt="Think With Me Logo" 
                      className="h-8 w-8"
                    />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Think With Me</h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Thinking Partners for Classrooms</p>
                  </div>
                </div>
                
                <NavigationMenu>
                  <NavigationMenuList>
                    <NavigationMenuItem>
                      <NavigationMenuLink asChild>
                        <Link 
                          to="/dashboard" 
                          className={`inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 ${
                            isActive('/dashboard') ? 'bg-accent text-accent-foreground' : ''
                          }`}
                        >
                          Home
                        </Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <NavigationMenuLink asChild>
                        <Link 
                          to="/marketplace" 
                          className={`inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 ${
                            isActive('/marketplace') ? 'bg-accent text-accent-foreground' : ''
                          }`}
                        >
                          Marketplace
                        </Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <NavigationMenuLink asChild>
                        <Link 
                          to="/professional-development" 
                          className={`inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 ${
                            isActive('/professional-development') ? 'bg-accent text-accent-foreground' : ''
                          }`}
                        >
                          Professional Development
                        </Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>
              </div>
              <UserSettingsDropdown />
            </div>
          </header>
          <div className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </div>
        </main>
        
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                © 2024 Think With Me. All rights reserved.
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Thinking Partners for Classrooms
              </div>
            </div>
          </div>
        </footer>
      </div>
    </ProtectedRoute>
  );
};

export default DashboardLayout;
