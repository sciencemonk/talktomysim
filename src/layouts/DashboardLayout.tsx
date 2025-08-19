
import { Link, useLocation, Outlet } from "react-router-dom";
import UserSettingsDropdown from "@/components/UserSettingsDropdown";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Brain } from "lucide-react";

const DashboardLayout = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex w-full bg-white flex-col">
        <main className="flex-1 flex flex-col">
          <header className="bg-white border-b border-gray-100 px-6 py-6">
            <div className="flex items-center justify-between max-w-7xl mx-auto w-full">
              <div className="flex items-center space-x-12">
                <Link to="/dashboard" className="flex items-center space-x-3 flex-shrink-0">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-light text-gray-900 tracking-tight">Think With Me</h1>
                    <p className="text-xs text-gray-500 font-light">Thinking Partners for Your Child</p>
                  </div>
                </Link>
                
                <NavigationMenu>
                  <NavigationMenuList>
                    <NavigationMenuItem>
                      <NavigationMenuLink asChild>
                        <Link 
                          to="/dashboard" 
                          className={`inline-flex h-10 w-max items-center justify-center rounded-full px-6 py-2 text-sm font-medium transition-all duration-200 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none ${
                            isActive('/dashboard') || isActive('/tutors') || isActive('/agents') ? 'bg-gray-100 text-gray-900' : 'text-gray-600'
                          }`}
                        >
                          Thinking Partners
                        </Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <NavigationMenuLink asChild>
                        <Link 
                          to="/child-profile" 
                          className={`inline-flex h-10 w-max items-center justify-center rounded-full px-6 py-2 text-sm font-medium transition-all duration-200 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none ${
                            isActive('/child-profile') ? 'bg-gray-100 text-gray-900' : 'text-gray-600'
                          }`}
                        >
                          Child Profile
                        </Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>
              </div>
              <UserSettingsDropdown />
            </div>
          </header>
          <div className="flex-1 py-12 px-6">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </div>
        </main>
        
        <footer className="bg-white border-t border-gray-100 py-8">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-md mr-3">
                  <Brain className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-lg font-light text-gray-900">Think With Me</h3>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-500">
                <div>© 2025 Think With Me. All rights reserved.</div>
                <div className="flex items-center gap-4">
                  <span>Privacy Policy</span>
                  <span>•</span>
                  <span>Terms of Service</span>
                  <span>•</span>
                  <span>Contact Us</span>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </ProtectedRoute>
  );
};

export default DashboardLayout;
