import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { 
  MessageCircle, 
  TrendingUp, 
  Clock, 
  Users, 
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  BarChart3,
  Settings,
  Calendar,
  Activity,
  Edit2,
  Save,
  X,
  Share2,
  Copy
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const MySim = () => {
  const { user } = useAuth();
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // Mock data - in a real app, this would come from your backend
  const simData = {
    name: "My Personal Sim",
    totalChats: 247,
    totalUsers: 89,
    avgSessionTime: "8.5 min",
    satisfactionScore: 4.7,
    lastActive: "2 hours ago",
    responseAccuracy: 94,
    popularTopics: [
      { topic: "Career advice", count: 34 },
      { topic: "Life decisions", count: 28 },
      { topic: "Personal growth", count: 22 },
      { topic: "Relationships", count: 18 }
    ],
    actionItems: [
      {
        id: 1,
        type: "follow-up",
        priority: "high",
        title: "Follow up with Sarah about job interview",
        description: "User mentioned they had an important interview - check back in a few days",
        dueDate: "2025-08-25"
      },
      {
        id: 2,
        type: "improvement",
        priority: "medium",
        title: "Add more content about financial planning",
        description: "Several users asked about investment advice - consider adding more resources",
        dueDate: "2025-08-30"
      },
      {
        id: 3,
        type: "fix",
        priority: "low",
        title: "Clarify response about meditation techniques",
        description: "User feedback suggests response was unclear - review and improve",
        dueDate: "2025-09-01"
      }
    ],
    recentActivity: [
      { 
        id: 1,
        time: "2 hours ago", 
        activity: "Chat with Alex about career change", 
        duration: "12 min",
        messages: [
          { role: "user", content: "I'm thinking about changing careers but I'm not sure if it's the right time." },
          { role: "system", content: "That's a big decision! Let's explore what's driving this feeling. What aspects of your current career are making you consider a change?" },
          { role: "user", content: "I feel like I'm not growing anymore, and the work doesn't excite me like it used to." },
          { role: "system", content: "It sounds like you're experiencing career stagnation, which is actually quite common. The fact that you're recognizing these feelings is the first step toward positive change. Have you identified any specific areas or industries that do interest you?" }
        ]
      },
      { 
        id: 2,
        time: "5 hours ago", 
        activity: "Helped Maria with relationship advice", 
        duration: "8 min",
        messages: [
          { role: "user", content: "My partner and I have been arguing a lot lately. I don't know what to do." },
          { role: "system", content: "I'm sorry to hear you're going through a difficult time. Arguments in relationships can be stressful, but they're also opportunities for growth and better understanding. Can you tell me what these arguments tend to be about?" },
          { role: "user", content: "It's usually about small things, but they escalate quickly. We both get defensive." },
          { role: "system", content: "It sounds like the issue might not be the topics themselves, but how you're communicating about them. When both people get defensive, it often means you're both feeling unheard or misunderstood. Have you tried having a calm conversation about your communication patterns when you're not in the middle of an argument?" }
        ]
      },
      { 
        id: 3,
        time: "1 day ago", 
        activity: "Discussed life goals with John", 
        duration: "15 min",
        messages: [
          { role: "user", content: "I feel like I'm drifting through life without clear goals. How do I figure out what I really want?" },
          { role: "system", content: "That's a profound question that many people struggle with. The feeling of drifting often comes from a disconnect between our daily actions and our deeper values. Let's start by exploring what matters most to you. When you think about the times you've felt most fulfilled or proud, what were you doing?" }
        ]
      },
      { 
        id: 4,
        time: "2 days ago", 
        activity: "Career guidance for Lisa", 
        duration: "10 min",
        messages: [
          { role: "user", content: "I just graduated and I'm overwhelmed by all the career options. How do I choose?" },
          { role: "system", content: "Congratulations on graduating! It's completely normal to feel overwhelmed by the possibilities ahead. This is actually an exciting time, even though it might feel daunting. Let's break this down into manageable steps. What subjects or activities during your studies did you find most engaging?" }
        ]
      }
    ]
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case "follow-up": return <MessageCircle className="h-4 w-4" />;
      case "improvement": return <TrendingUp className="h-4 w-4" />;
      case "fix": return <Settings className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const handleActivityClick = (activity: any) => {
    setSelectedActivity(activity);
  };

  const handleShareClick = async () => {
    const shareUrl = `${window.location.origin}/sim/my-personal-sim`; // Placeholder URL
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Link Copied!",
        description: "Share link for your sim has been copied to clipboard.",
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy link to clipboard.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full max-w-none mx-0 p-6 space-y-6">
      {/* Share Tile */}
      <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={handleShareClick}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                {copied ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <Share2 className="h-5 w-5 text-primary" />
                )}
              </div>
              <div>
                <h3 className="font-medium">Share Your Sim</h3>
                <p className="text-sm text-muted-foreground">
                  {copied ? "Link copied to clipboard!" : "Click to copy share link"}
                </p>
              </div>
            </div>
            <Copy className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity - Moved to Top */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {simData.recentActivity.map((activity, index) => (
            <div 
              key={index} 
              className="space-y-1 pb-3 border-b last:border-b-0 last:pb-0 cursor-pointer hover:bg-muted/30 p-2 rounded transition-colors duration-200"
              onClick={() => handleActivityClick(activity)}
            >
              <p className="text-sm font-medium">{activity.activity}</p>
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>{activity.time}</span>
                <span>{activity.duration}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{simData.totalChats}</p>
                <p className="text-sm text-muted-foreground">Total Conversations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{simData.totalUsers}</p>
                <p className="text-sm text-muted-foreground">Unique Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{simData.avgSessionTime}</p>
                <p className="text-sm text-muted-foreground">Avg Session Time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{simData.satisfactionScore}/5</p>
                <p className="text-sm text-muted-foreground">Satisfaction Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Action Items */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Action Items
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {simData.actionItems.map((item) => (
                <div key={item.id} className="flex items-start gap-3 p-4 border rounded-lg">
                  <div className="flex-shrink-0 mt-1">
                    {getActionIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className="font-medium">{item.title}</h4>
                      <Badge variant="outline" className={getPriorityColor(item.priority)}>
                        {item.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      Due: {item.dueDate}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="flex-shrink-0">
                    Mark Complete
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Popular Topics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Popular Topics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {simData.popularTopics.map((topic, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm">{topic.topic}</span>
                  <Badge variant="secondary">{topic.count}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Chat Modal */}
      <Dialog open={!!selectedActivity} onOpenChange={() => setSelectedActivity(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              {selectedActivity?.activity}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              {selectedActivity?.time} • Duration: {selectedActivity?.duration}
            </p>
          </DialogHeader>
          
          <div className="flex-1 overflow-auto space-y-4 pr-2">
            {selectedActivity?.messages?.map((message: any, index: number) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`rounded-lg px-4 py-2 max-w-[75%] ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MySim;
