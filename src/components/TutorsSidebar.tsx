
import { Link, useLocation } from "react-router-dom";
import { Bot, PlusCircle, Home, Settings, List, Users } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const TutorsSidebar: React.FC = () => {
  const location = useLocation();
  
  const mainMenuItems = [
    {
      title: "Dashboard",
      url: "/tutors",
      icon: Home,
      exact: true
    },
    {
      title: "My Tutors",
      url: "/tutors?filter=my-tutors",
      icon: Bot
    },
    {
      title: "Team Tutors",
      url: "/tutors?filter=team-tutors",
      icon: Users
    },
    {
      title: "All Tutors",
      url: "/tutors?filter=all-tutors",
      icon: List
    }
  ];
  
  const isActive = (item: { url: string, exact?: boolean }) => {
    if (item.exact) {
      return location.pathname === item.url;
    }
    return location.pathname.startsWith(item.url.split('?')[0]) && 
           (location.search === item.url.split('?')[1] ? `?${item.url.split('?')[1]}` : false || !item.url.includes('?'));
  };

  return (
    <Sidebar className="border-r border-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center space-x-2">
          <Bot className="h-6 w-6 text-brandPurple" />
          <h1 className="text-xl font-semibold text-fg">Tutor Hub</h1>
        </div>
        <SidebarTrigger className="absolute right-2 top-4" />
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className={cn(
                    isActive(item) 
                      ? "bg-brandPurple/10 text-brandPurple font-medium" 
                      : "text-fgMuted hover:bg-bgMuted"
                  )}>
                    <Link to={item.url} className="flex items-center space-x-3 px-3 py-2 rounded-md transition-all duration-200">
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup className="mt-6">
          <SidebarGroupLabel>Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="bg-brandPurple text-white hover:bg-brandPurple/90">
                  <Link to="/tutors/create" className="flex items-center space-x-3 px-3 py-2 rounded-md transition-all duration-200">
                    <PlusCircle className="h-5 w-5" />
                    <span>Create New Tutor</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-4 border-t border-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="text-fgMuted hover:bg-bgMuted">
              <Link to="/tutors/settings" className="flex items-center space-x-3 px-3 py-2 rounded-md transition-all duration-200">
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default TutorsSidebar;
