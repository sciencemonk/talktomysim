
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, MessageSquare, Users, TrendingUp, ExternalLink } from "lucide-react";

const SimpleTeacherDashboard = () => {
  const navigate = useNavigate();
  
  // Mock data - in real app this would come from your backend
  const [tutors] = useState([
    {
      id: "1",
      name: "Science Helper",
      subject: "Physics & Chemistry", 
      students: 24,
      conversations: 156,
      status: "active"
    },
    {
      id: "2", 
      name: "Math Tutor",
      subject: "Algebra & Calculus",
      students: 18,
      conversations: 89,
      status: "active"
    },
    {
      id: "3",
      name: "English Coach",
      subject: "Writing & Grammar",
      students: 31,
      conversations: 203,
      status: "inactive"
    }
  ]);

  const totalStudents = tutors.reduce((sum, tutor) => sum + tutor.students, 0);
  const totalConversations = tutors.reduce((sum, tutor) => sum + tutor.conversations, 0);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero section */}
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-semibold text-fg tracking-tight">
          Your AI Tutors
        </h1>
        <p className="text-lg text-fgMuted max-w-2xl mx-auto">
          Create intelligent tutors that help students learn at their own pace.
        </p>
        
        {tutors.length === 0 ? (
          <Button 
            onClick={() => navigate("/create-tutor")}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-base font-medium rounded-xl transition-all duration-200 hover:scale-105"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Your First Tutor
          </Button>
        ) : (
          <div className="flex items-center justify-center gap-4">
            <Button 
              onClick={() => navigate("/create-tutor")}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Tutor
            </Button>
          </div>
        )}
      </div>

      {/* Stats */}
      {tutors.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-semibold text-fg mb-1">{tutors.length}</div>
              <div className="text-sm text-fgMuted">Active Tutors</div>
            </CardContent>
          </Card>
          
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-semibold text-fg mb-1">{totalStudents}</div>
              <div className="text-sm text-fgMuted">Students Helped</div>
            </CardContent>
          </Card>
          
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-semibold text-fg mb-1">{totalConversations}</div>
              <div className="text-sm text-fgMuted">Conversations</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tutors grid */}
      {tutors.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-fg">Your Tutors</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tutors.map((tutor, index) => (
              <Card 
                key={tutor.id} 
                className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 cursor-pointer group animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => navigate(`/agents/${tutor.id}`)}
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-fg text-lg mb-1 group-hover:text-primary transition-colors">
                        {tutor.name}
                      </h3>
                      <p className="text-fgMuted text-sm">{tutor.subject}</p>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${tutor.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Users className="w-4 h-4 text-fgMuted mr-1" />
                        <span className="font-semibold text-fg">{tutor.students}</span>
                      </div>
                      <div className="text-xs text-fgMuted">Students</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <MessageSquare className="w-4 h-4 text-fgMuted mr-1" />
                        <span className="font-semibold text-fg">{tutor.conversations}</span>
                      </div>
                      <div className="text-xs text-fgMuted">Chats</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2">
                    <Button
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`/tutors/${tutor.id}`, '_blank');
                      }}
                      className="text-fgMuted hover:text-fg"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Preview
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/agents/${tutor.id}`);
                      }}
                      className="text-primary hover:text-primary/80"
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

export default SimpleTeacherDashboard;
