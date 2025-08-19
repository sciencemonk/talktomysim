
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Share2,
  Copy,
  ExternalLink,
  Play
} from "lucide-react";
import { AgentType } from "@/types/agent";
import { toast } from "@/components/ui/use-toast";

interface StudentUsageStatsProps {
  agent: AgentType;
}

export const StudentUsageStats: React.FC<StudentUsageStatsProps> = ({ agent }) => {
  // Generate shareable link
  const shareableLink = `${window.location.origin}/tutors/${agent.id}/chat`;
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableLink);
    toast({
      title: "Link copied!",
      description: "Your child can use this link to start learning."
    });
  };

  const handleShareLink = () => {
    if (navigator.share) {
      navigator.share({
        title: `${agent.name} - Thinking Partner`,
        text: `Start learning with ${agent.name}`,
        url: shareableLink
      });
    } else {
      handleCopyLink();
    }
  };

  const handleStartChat = () => {
    window.open(shareableLink, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Quick Start Section */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Play className="h-5 w-5" />
            Ready to Start Learning
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-blue-800 text-sm">
            {agent.name} is ready to help your child explore and learn. Click the button below to start a learning session.
          </p>
          <Button 
            onClick={handleStartChat}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            size="lg"
          >
            <Play className="mr-2 h-4 w-4" />
            Start Learning Session
          </Button>
        </CardContent>
      </Card>

      {/* Share Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share with Your Child
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="shareable-link">Direct Link for Your Child</Label>
            <div className="flex gap-2">
              <Input
                id="shareable-link"
                value={shareableLink}
                readOnly
                className="flex-1 bg-gray-50"
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
            Your child can bookmark this link or you can add it to their device's home screen for easy access.
          </p>
        </CardContent>
      </Card>

      {/* Tips for Parents */}
      <Card>
        <CardHeader>
          <CardTitle>Tips for Great Learning Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-gray-700">Encourage your child to ask "why" and "how" questions to deepen understanding</span>
            </div>
            <div className="flex gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-gray-700">The AI will guide them through problems step-by-step rather than giving direct answers</span>
            </div>
            <div className="flex gap-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-gray-700">Sessions work best when your child is curious and ready to explore ideas</span>
            </div>
            <div className="flex gap-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-gray-700">Each thinking partner adapts to your child's learning style and pace</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
