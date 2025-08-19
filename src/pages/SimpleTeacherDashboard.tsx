
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Play, Settings } from "lucide-react";

const SimpleParentDashboard = () => {
  const navigate = useNavigate();
  
  // Mock data - in real app this would come from your backend
  const [thinkingPartners] = useState([
    {
      id: "1",
      name: "Science Helper",
      subject: "Physics & Chemistry", 
      description: "Helps explore scientific concepts through fun experiments and explanations",
      status: "active"
    },
    {
      id: "2", 
      name: "Math Partner",
      subject: "Algebra & Calculus",
      description: "Makes math fun with step-by-step problem solving and creative approaches",
      status: "active"
    },
    {
      id: "3",
      name: "Reading Buddy",
      subject: "Literature & Writing",
      description: "Discusses books, helps with writing, and explores storytelling together",
      status: "active"
    }
  ]);

  const handleStartChat = (partnerId: string) => {
    window.open(`/tutors/${partnerId}/chat`, '_blank');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero section */}
      <div className="text-center space-y-6">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-fg tracking-tight">
          Your Child's Learning Journey
        </h1>
        <p className="text-base sm:text-lg text-fgMuted max-w-2xl mx-auto px-4 sm:px-0">
          AI thinking partners that adapt to your child's curiosity and help them explore ideas at their own pace.
        </p>
        
        {thinkingPartners.length === 0 ? (
          <Button 
            onClick={() => navigate("/agents/create")}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-base font-medium rounded-xl transition-all duration-200 hover:scale-105"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Your First Thinking Partner
          </Button>
        ) : (
          <div className="flex items-center justify-center gap-4">
            <Button 
              onClick={() => navigate("/agents/create")}
              size="lg"
              variant="outline"
              className="px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add New Partner
            </Button>
          </div>
        )}
      </div>

      {/* Thinking Partners grid */}
      {thinkingPartners.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-fg text-center">Ready to Learn</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {thinkingPartners.map((partner, index) => (
              <Card 
                key={partner.id} 
                className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group animate-slide-up overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6 space-y-4">
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mx-auto">
                      <div className="text-2xl">🤖</div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-fg text-xl mb-1 group-hover:text-primary transition-colors">
                        {partner.name}
                      </h3>
                      <p className="text-primary/80 text-sm font-medium">{partner.subject}</p>
                    </div>
                  </div>
                  
                  <p className="text-fgMuted text-sm text-center leading-relaxed min-h-[3rem] flex items-center justify-center">
                    {partner.description}
                  </p>
                  
                  <div className="flex flex-col gap-2 pt-2">
                    <Button
                      onClick={() => handleStartChat(partner.id)}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 shadow-md"
                      size="lg"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Start Learning Session
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate(`/agents/${partner.id}`)}
                      className="text-fgMuted hover:text-fg w-full"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Customize
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Getting Started Section for New Users */}
      {thinkingPartners.length === 0 && (
        <div className="max-w-4xl mx-auto">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-8 text-center space-y-6">
              <h3 className="text-xl font-semibold text-fg">How It Works</h3>
              <div className="grid md:grid-cols-3 gap-6 text-sm">
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-lg font-bold text-primary">1</span>
                  </div>
                  <h4 className="font-medium text-fg">Create</h4>
                  <p className="text-fgMuted">Set up thinking partners for different subjects and your child's interests</p>
                </div>
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-lg font-bold text-primary">2</span>
                  </div>
                  <h4 className="font-medium text-fg">Launch</h4>
                  <p className="text-fgMuted">Your child clicks to start a learning session with their AI thinking partner</p>
                </div>
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-lg font-bold text-primary">3</span>
                  </div>
                  <h4 className="font-medium text-fg">Learn</h4>
                  <p className="text-fgMuted">They explore ideas together through natural conversation and discovery</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SimpleParentDashboard;
