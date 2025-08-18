
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Bot, MessageCircle, Star, Users, Calendar, ArrowLeft, Share2, Heart } from "lucide-react";
import { useAgentDetails } from "@/hooks/useAgentDetails";
import { Skeleton } from "@/components/ui/skeleton";
import { ShareButton } from "@/components/ShareButton";

const PublicTutorDetail = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const { agent, isLoading, error } = useAgentDetails(agentId);
  const [isLiked, setIsLiked] = useState(false);

  const handleBack = () => {
    navigate('/');
  };

  const handleDemo = () => {
    navigate(`/tutors/${agentId}/chat`);
  };

  const handleSignIn = () => {
    navigate('/dashboard');
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    // TODO: Implement like functionality with authentication
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-10 w-32" />
            <div className="flex items-center gap-6">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="space-y-3">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-48" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            </div>
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <Bot className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Tutor Not Found
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              The tutor you're looking for doesn't exist or may have been removed.
            </p>
            <Button onClick={handleBack} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Directory
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center space-x-2">
                <Bot className="h-6 w-6 text-blue-600" />
                <span className="text-lg font-bold text-gray-900 dark:text-white">Agent Hub</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleSignIn}>
                Sign In with Google
              </Button>
              <Button onClick={handleSignIn} className="bg-blue-600 hover:bg-blue-700">
                Create Your Own
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Tutor Header */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <Avatar className="h-24 w-24 border-4 border-blue-100">
                <AvatarImage src={agent.avatar} alt={agent.name} />
                <AvatarFallback>
                  <Bot className="h-12 w-12" />
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {agent.name}
                    </h1>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="default">{agent.type}</Badge>
                      {agent.subject && (
                        <Badge variant="secondary">{agent.subject}</Badge>
                      )}
                      {agent.gradeLevel && (
                        <Badge variant="outline">{agent.gradeLevel}</Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLike}
                      className={isLiked ? "text-red-500" : "text-gray-500"}
                    >
                      <Heart className={`h-4 w-4 ${isLiked ? "fill-red-500" : ""}`} />
                    </Button>
                    <ShareButton 
                      tutorId={agent.id} 
                      tutorName={agent.name}
                    />
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-300 text-lg mb-6">
                  {agent.description}
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    size="lg" 
                    onClick={handleDemo}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Try Demo Chat
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={handleSignIn}
                  >
                    Sign In to Use
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats and Details */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Performance Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Interactions</span>
                  <span className="font-semibold">{agent.interactions || 0}</span>
                </div>
                <Separator />
                {agent.performance && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">Rating</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{agent.performance.toFixed(1)}</span>
                      </div>
                    </div>
                    <Separator />
                  </>
                )}
                {agent.studentsSaved && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">Students Helped</span>
                      <span className="font-semibold">{agent.studentsSaved}</span>
                    </div>
                    <Separator />
                  </>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Created</span>
                  <span className="font-semibold">
                    {new Date(agent.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Details Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  Tutor Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {agent.teachingStyle && (
                  <>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">Teaching Style</h4>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">{agent.teachingStyle}</p>
                    </div>
                    <Separator />
                  </>
                )}
                {agent.learningObjective && (
                  <>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">Learning Objective</h4>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">{agent.learningObjective}</p>
                    </div>
                    <Separator />
                  </>
                )}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">Availability</h4>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="secondary" className="text-xs">
                      <MessageCircle className="h-3 w-3 mr-1" />
                      Chat Available
                    </Badge>
                    {agent.status === 'active' ? (
                      <Badge variant="default" className="text-xs">Active</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Draft</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action */}
          <Card className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Ready to create your own AI tutor?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
                Join thousands of educators who are already using AI to enhance their teaching. 
                Create personalized tutors for your students in minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  onClick={handleSignIn}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Get Started Free
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={handleBack}
                >
                  Browse More Tutors
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PublicTutorDetail;
