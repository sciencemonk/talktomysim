
import { Link, useLocation, Outlet } from "react-router-dom";
import UserSettingsDropdown from "@/components/UserSettingsDropdown";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import ProtectedRoute from "@/components/ProtectedRoute";

const DashboardLayout = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex w-full bg-gray-50 flex-col">
        <main className="flex-1 flex flex-col">
          <header className="bg-white border-b border-gray-200 px-6 py-4">
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
                    <h1 className="text-xl font-bold text-gray-900">Think With Me</h1>
                    <p className="text-xs text-gray-500">Thinking Partners for Classrooms</p>
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
                          to="/agents" 
                          className={`inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 ${
                            isActive('/agents') ? 'bg-accent text-accent-foreground' : ''
                          }`}
                        >
                          Tutors
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
                    <NavigationMenuItem>
                      <NavigationMenuLink asChild>
                        <Link 
                          to="/settings" 
                          className={`inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 ${
                            isActive('/settings') ? 'bg-accent text-accent-foreground' : ''
                          }`}
                        >
                          Settings
                        </Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <NavigationMenuLink asChild>
                        <Link 
                          to="/billing" 
                          className={`inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 ${
                            isActive('/billing') ? 'bg-accent text-accent-foreground' : ''
                          }`}
                        >
                          Billing
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
              <Outlet />
            </div>
          </div>
        </main>
        
        <footer className="bg-white border-t border-gray-200 py-6">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                © 2024 Think With Me. All rights reserved.
              </div>
              <div className="text-sm text-gray-500">
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
