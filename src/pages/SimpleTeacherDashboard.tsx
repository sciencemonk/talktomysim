
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, MessageSquare, Users, ExternalLink } from "lucide-react";

const SimpleParentDashboard = () => {
  const navigate = useNavigate();
  
  // Mock data - in real app this would come from your backend
  const [thinkingPartners] = useState([
    {
      id: "1",
      name: "Science Helper",
      subject: "Physics & Chemistry", 
      children: 24,
      conversations: 156,
      status: "active"
    },
    {
      id: "2", 
      name: "Math Partner",
      subject: "Algebra & Calculus",
      children: 18,
      conversations: 89,
      status: "active"
    },
    {
      id: "3",
      name: "English Coach",
      subject: "Writing & Grammar",
      children: 31,
      conversations: 203,
      status: "inactive"
    }
  ]);

  const totalChildren = thinkingPartners.reduce((sum, partner) => sum + partner.children, 0);
  const totalConversations = thinkingPartners.reduce((sum, partner) => sum + partner.conversations, 0);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Hero section */}
      <div className="text-center space-y-4 sm:space-y-6">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-fg tracking-tight">
          Your Child's AI Thinking Partners
        </h1>
        <p className="text-base sm:text-lg text-fgMuted max-w-2xl mx-auto px-4 sm:px-0">
          Create intelligent thinking partners that help your child learn at their own pace.
        </p>
        
        {thinkingPartners.length === 0 ? (
          <Button 
            onClick={() => navigate("/create-tutor")}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 sm:px-8 py-3 text-base font-medium rounded-xl transition-all duration-200 hover:scale-105"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Your First Thinking Partner
          </Button>
        ) : (
          <div className="flex items-center justify-center gap-4">
            <Button 
              onClick={() => navigate("/create-tutor")}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 sm:px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105"
            >
              <Plus className="w-5 h-5 mr-2" />
              <span className="hidden sm:inline">Create Thinking Partner</span>
              <span className="sm:hidden">Create</span>
            </Button>
          </div>
        )}
      </div>

      {/* Stats */}
      {thinkingPartners.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="text-2xl sm:text-3xl font-semibold text-fg mb-1">{thinkingPartners.length}</div>
              <div className="text-sm text-fgMuted">Active Partners</div>
            </CardContent>
          </Card>
          
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="text-2xl sm:text-3xl font-semibold text-fg mb-1">{totalChildren}</div>
              <div className="text-sm text-fgMuted">Children Helped</div>
            </CardContent>
          </Card>
          
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="text-2xl sm:text-3xl font-semibold text-fg mb-1">{totalConversations}</div>
              <div className="text-sm text-fgMuted">Conversations</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Thinking Partners grid */}
      {thinkingPartners.length > 0 && (
        <div className="space-y-4 sm:space-y-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-fg">Your Child's Thinking Partners</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {thinkingPartners.map((partner, index) => (
              <Card 
                key={partner.id} 
                className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 cursor-pointer group animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => navigate(`/agents/${partner.id}`)}
              >
                <CardContent className="p-4 sm:p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-fg text-base sm:text-lg mb-1 group-hover:text-primary transition-colors truncate">
                        {partner.name}
                      </h3>
                      <p className="text-fgMuted text-sm truncate">{partner.subject}</p>
                    </div>
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ml-2 ${partner.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Users className="w-4 h-4 text-fgMuted mr-1" />
                        <span className="font-semibold text-fg text-sm sm:text-base">{partner.children}</span>
                      </div>
                      <div className="text-xs text-fgMuted">Children</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <MessageSquare className="w-4 h-4 text-fgMuted mr-1" />
                        <span className="font-semibold text-fg text-sm sm:text-base">{partner.conversations}</span>
                      </div>
                      <div className="text-xs text-fgMuted">Chats</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 gap-2">
                    <Button
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`/tutors/${partner.id}`, '_blank');
                      }}
                      className="text-fgMuted hover:text-fg flex-1 sm:flex-none"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline">Preview</span>
                      <span className="sm:hidden">View</span>
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/agents/${partner.id}`);
                      }}
                      className="text-primary hover:text-primary/80 flex-1 sm:flex-none"
                    >
                      Configure
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleParentDashboard;
