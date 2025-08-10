
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Users, 
  MessageSquare, 
  Clock, 
  TrendingUp, 
  Calendar,
  Share2,
  Copy,
  ExternalLink,
  BarChart3,
  Activity
} from "lucide-react";
import { AgentType } from "@/types/agent";
import { toast } from "@/components/ui/use-toast";

interface StudentUsageStatsProps {
  agent: AgentType;
}

export const StudentUsageStats: React.FC<StudentUsageStatsProps> = ({ agent }) => {
  // Generate shareable link
  const shareableLink = `${window.location.origin}/chat/${agent.id}`;
  
  // Mock usage statistics - in a real app, these would come from analytics
  const usageStats = {
    totalStudents: agent.studentsSaved || Math.floor(Math.random() * 150) + 50,
    activeToday: Math.floor(Math.random() * 25) + 5,
    totalMessages: agent.interactions || Math.floor(Math.random() * 2000) + 500,
    averageSessionTime: "12m 30s",
    satisfactionScore: agent.helpfulnessScore || (Math.random() * 2 + 8),
    topSubjects: ["Algebra", "Geometry", "Word Problems"],
    peakHours: "3-5 PM",
    weeklyGrowth: "+15%"
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableLink);
    toast({
      title: "Link copied!",
      description: "Shareable link has been copied to clipboard."
    });
  };

  const handleShareLink = () => {
    if (navigator.share) {
      navigator.share({
        title: `Chat with ${agent.name}`,
        text: `Get help with your studies from ${agent.name}, an AI tutor`,
        url: shareableLink
      });
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="space-y-6">
      {/* Shareable Link Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Your Tutor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="shareable-link">Shareable Link</Label>
            <div className="flex gap-2">
              <Input
                id="shareable-link"
                value={shareableLink}
                readOnly
                className="flex-1"
              />
              <Button onClick={handleCopyLink} variant="outline" size="sm">
                <Copy className="h-4 w-4" />
              </Button>
              <Button onClick={handleShareLink} variant="outline" size="sm">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Students can use this link to chat directly with your tutor
          </p>
        </CardContent>
      </Card>

      {/* Usage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">{usageStats.totalStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Activity className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Today</p>
                <p className="text-2xl font-bold">{usageStats.activeToday}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <MessageSquare className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Messages</p>
                <p className="text-2xl font-bold">{usageStats.totalMessages.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Weekly Growth</p>
                <p className="text-2xl font-bold text-green-600">{usageStats.weeklyGrowth}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Student Engagement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Average Session Time</span>
              <Badge variant="secondary">{usageStats.averageSessionTime}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Satisfaction Score</span>
              <Badge variant="secondary">{usageStats.satisfactionScore.toFixed(1)}/10</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Peak Usage Hours</span>
              <Badge variant="secondary">{usageStats.peakHours}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Popular Topics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {usageStats.topSubjects.map((subject, index) => (
                <div key={subject} className="flex items-center gap-3">
                  <div className="w-8 h-6 bg-blue-100 rounded flex items-center justify-center">
                    <span className="text-xs font-medium text-blue-600">#{index + 1}</span>
                  </div>
                  <span className="text-sm">{subject}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Student asked about quadratic equations - 2 minutes ago</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm">New student started a chat session - 15 minutes ago</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-sm">Student completed a practice problem - 1 hour ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
