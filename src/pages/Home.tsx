
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Menu, X } from 'lucide-react';
import { usePublicAgents } from '@/hooks/usePublicAgents';
import { Link } from 'react-router-dom';
import AuthModal from '@/components/AuthModal';

const Home = () => {
  const { user } = useAuth();
  const { data: agents = [] } = usePublicAgents();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.subject_area?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (user) {
    // Authenticated user view - redirect to main app
    window.location.href = '/app';
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Mobile Header */}
      <div className="lg:hidden border-b border-border bg-background">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/a5a8957b-48cb-40f5-9097-0ab747b74077.png" 
              alt="Think With Me" 
              className="w-8 h-8"
            />
            <h1 className="text-xl font-bold text-fg">Sim</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      <div className="flex h-screen lg:h-screen">
        {/* Sidebar */}
        <div className={`
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 transition-transform duration-300 ease-in-out
          fixed lg:static inset-y-0 left-0 z-50 w-80 bg-background border-r border-border
          flex flex-col
        `}>
          {/* Desktop Header */}
          <div className="hidden lg:block border-b border-border p-6">
            <div className="flex items-center space-x-2">
              <img 
                src="/lovable-uploads/a5a8957b-48cb-40f5-9097-0ab747b74077.png" 
                alt="Think With Me" 
                className="w-8 h-8"
              />
              <h1 className="text-xl font-bold text-fg">Sim</h1>
            </div>
          </div>

          {/* Login Section */}
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center space-y-6">
              <p className="text-lg font-medium text-fg">Create your free Sim today.</p>
              <Button 
                onClick={() => setShowAuthModal(true)}
                className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 animate-pulse"
              >
                Get started
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search Header - Desktop */}
          <div className="hidden lg:flex items-center justify-between border-b border-border p-6">
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search tutors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <img 
                  src="/lovable-uploads/a5a8957b-48cb-40f5-9097-0ab747b74077.png" 
                  alt="Think With Me" 
                  className="w-6 h-6"
                />
                <h2 className="text-lg font-semibold text-fg">Sim</h2>
              </div>
              <Button 
                size="sm" 
                onClick={() => setShowAuthModal(true)}
                className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 animate-pulse"
              >
                Get started
              </Button>
            </div>
          </div>

          {/* Search Bar - Mobile */}
          <div className="lg:hidden border-b border-border p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search tutors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-6">
            <div className="max-w-6xl mx-auto">
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-fg mb-2">Discover AI Tutors</h1>
                <p className="text-muted-foreground">Find the perfect AI tutor for your learning needs</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAgents.map((agent) => (
                  <Link
                    key={agent.id}
                    to={`/tutors/${agent.id}`}
                    className="block group"
                  >
                    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all duration-200 group-hover:border-primary/20">
                      <div className="flex items-start space-x-4">
                        <img
                          src={agent.avatar_url || "/placeholder.svg"}
                          alt={agent.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-fg group-hover:text-primary transition-colors">
                            {agent.name}
                          </h3>
                          {agent.subject_area && (
                            <p className="text-sm text-primary mb-2">{agent.subject_area}</p>
                          )}
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {agent.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {filteredAgents.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No tutors found matching your search.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Auth Modal */}
      <AuthModal 
        open={showAuthModal} 
        onOpenChange={setShowAuthModal} 
      />
    </div>
  );
};

export default Home;
