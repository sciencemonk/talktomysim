
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { 
  Share2, 
  Copy, 
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
  X
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";

const MySim = () => {
  const { user } = useAuth();

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
      { time: "2 hours ago", activity: "Chat with Alex about career change", duration: "12 min" },
      { time: "5 hours ago", activity: "Helped Maria with relationship advice", duration: "8 min" },
      { time: "1 day ago", activity: "Discussed life goals with John", duration: "15 min" },
      { time: "2 days ago", activity: "Career guidance for Lisa", duration: "10 min" }
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

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-fg">{simData.name}</h1>
        <p className="text-fgMuted">Manage and monitor your personal AI companion</p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{simData.totalChats}</p>
                <p className="text-sm text-fgMuted">Total Conversations</p>
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
                <p className="text-sm text-fgMuted">Unique Users</p>
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
                <p className="text-sm text-fgMuted">Avg Session Time</p>
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
                <p className="text-sm text-fgMuted">Satisfaction Score</p>
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
                    <p className="text-sm text-fgMuted mb-2">{item.description}</p>
                    <div className="flex items-center gap-2 text-xs text-fgMuted">
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

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {simData.recentActivity.map((activity, index) => (
                <div key={index} className="space-y-1 pb-3 border-b last:border-b-0 last:pb-0">
                  <p className="text-sm font-medium">{activity.activity}</p>
                  <div className="flex justify-between items-center text-xs text-fgMuted">
                    <span>{activity.time}</span>
                    <span>{activity.duration}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MySim;
