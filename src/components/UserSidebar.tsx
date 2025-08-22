
import { useLocation } from "react-router-dom";
import { 
  Bot, 
  Plus, 
  Settings, 
  LogOut, 
  User2,
  Target,
  FileText, 
  Home,
  Info,
  MessageSquare,
  Brain,
  BookOpen,
  Search
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAgents } from "@/hooks/useAgents";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useState } from "react";

interface UserSidebarProps {
  onCreateAgent?: () => void;
  onSelectAgent?: (agentId: string) => void;
  selectedAgentId?: string;
  onShowAdvisorDirectory?: () => void;
}

const UserSidebar = ({ 
  onCreateAgent, 
  onSelectAgent, 
  selectedAgentId,
  onShowAdvisorDirectory,
  onClose
}: UserSidebarProps & { onClose?: () => void }) => {
  const { user, signOut } = useAuth();
  const { data: agents, isLoading } = useAgents();
  const location = useLocation();
  
  const handleSignOut = async () => {
    await signOut();
    onClose?.();
  };

  const handleCreateAgent = () => {
    onCreateAgent?.();
    onClose?.();
  };

  const handleSelectAgent = (agentId: string) => {
    onSelectAgent?.(agentId);
    onClose?.();
  };

  const navigateTo = (path: string) => {
    window.location.href = path;
  };

  // Navigation items for signed-in users
  const navItems = [
    {
      title: "My Sim",
      icon: User2,
      href: "#",
      onClick: () => {
        // TODO: Navigate to My Sim page
        console.log("Navigate to My Sim");
        onClose?.();
      }
    },
    {
      title: "Basic Info",
      icon: Info,
      href: "/basic-info",
      onClick: () => {
        navigateTo("/basic-info");
        onClose?.();
      }
    },
    {
      title: "Interaction Model",
      icon: MessageSquare,
      href: "#",
      onClick: () => {
        // TODO: Navigate to Interaction Model page
        console.log("Navigate to Interaction Model");
        onClose?.();
      }
    },
    {
      title: "Core Knowledge",
      icon: Brain,
      href: "#",
      onClick: () => {
        // TODO: Navigate to Core Knowledge page
        console.log("Navigate to Core Knowledge");
        onClose?.();
      }
    },
    {
      title: "Find a Sim",
      icon: Search,
      href: "#",
      onClick: () => {
        onShowAdvisorDirectory?.();
        onClose?.();
      }
    }
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* User Profile Section */}
      {user && (
        <div className="p-4 border-b">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={user.user_metadata?.avatar_url} />
              <AvatarFallback>
                {user.email?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user.user_metadata?.full_name || user.email}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          </div>
        </div>
      )}

      <ScrollArea className="flex-1 px-3">
        <div className="space-y-2 py-4">
          {/* Home Link */}
          <Button
            variant={location.pathname === "/" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => {
              navigateTo("/");
              onClose?.();
            }}
          >
            <Home className="mr-2 h-4 w-4" />
            Home
          </Button>
          
          {user && (
            <>
              <Separator className="my-2" />
              
              {/* Navigation Items */}
              {navItems.map((item) => (
                <Button
                  key={item.title}
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={item.onClick}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Button>
              ))}
              
              {/* Show agents section only if user has created agents */}
              {agents && agents.length > 0 && (
                <>
                  <Separator className="my-4" />
                  
                  <div className="px-2 py-2">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Teaching Assistants
                    </h3>
                  </div>
                  
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-primary"
                    onClick={handleCreateAgent}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Assistant
                  </Button>

                  {!isLoading && agents.map((agent) => (
                    <Button
                      key={agent.id}
                      variant={selectedAgentId === agent.id ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => handleSelectAgent(agent.id)}
                    >
                      <Bot className="mr-2 h-4 w-4" />
                      <span className="truncate">{agent.name}</span>
                      <div className="ml-auto flex items-center space-x-1">
                        <div className={`w-2 h-2 rounded-full ${
                          agent.status === 'active' ? 'bg-green-500' : 
                          agent.status === 'training' ? 'bg-yellow-500' : 'bg-gray-400'
                        }`} />
                      </div>
                    </Button>
                  ))}
                </>
              )}
            </>
          )}
        </div>
      </ScrollArea>

      {/* Footer Actions */}
      <div className="p-4 border-t space-y-2">
        {user ? (
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        ) : (
          <Button
            variant="default"
            className="w-full"
            onClick={() => {
              navigateTo("/login");
              onClose?.();
            }}
          >
            Sign In
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          {sidebarContent}
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-card border-r">
        {sidebarContent}
      </div>
    </>
  );
};

const MobileSidebar = (props: UserSidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-64">
        <UserSidebar {...props} onClose={() => setIsOpen(false)} />
      </SheetContent>
    </Sheet>
  );
};

export default UserSidebar;
export { MobileSidebar };
