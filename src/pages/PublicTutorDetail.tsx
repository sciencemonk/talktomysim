
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Bot, MessageCircle, Star, Users, Calendar, ArrowLeft, Share2, Heart, Shield, CheckCircle, Award } from "lucide-react";
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
      <div className="min-h-screen bg-white dark:bg-gray-900">
        {/* Header */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="p-1 sm:p-2 rounded-lg flex items-center justify-center">
                  <img 
                    src="/lovable-uploads/1a618b3c-11e7-43e4-a2d5-c1e6f36e48ba.png" 
                    alt="Think With Me Logo" 
                    className="h-8 w-8 sm:h-12 sm:w-12"
                  />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Think With Me</h1>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Thinking Partners for Classrooms</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={handleBack}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button 
                  onClick={handleSignIn} 
                  className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 rounded-full text-sm sm:text-base px-4 sm:px-6 py-2 flex items-center gap-2 shadow-sm"
                >
                  <img 
                    src="/lovable-uploads/b0174e22-c5cc-4bc5-8b34-8df738173560.png" 
                    alt="Google" 
                    className="h-4 w-4 sm:h-5 sm:w-5"
                  />
                  Sign in with Google
                </Button>
              </div>
            </div>
          </div>
        </header>

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
      <div className="min-h-screen bg-white dark:bg-gray-900">
        {/* Header */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="p-1 sm:p-2 rounded-lg flex items-center justify-center">
                  <img 
                    src="/lovable-uploads/1a618b3c-11e7-43e4-a2d5-c1e6f36e48ba.png" 
                    alt="Think With Me Logo" 
                    className="h-8 w-8 sm:h-12 sm:w-12"
                  />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Think With Me</h1>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Thinking Partners for Classrooms</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  onClick={handleSignIn} 
                  className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 rounded-full text-sm sm:text-base px-4 sm:px-6 py-2 flex items-center gap-2 shadow-sm"
                >
                  <img 
                    src="/lovable-uploads/b0174e22-c5cc-4bc5-8b34-8df738173560.png" 
                    alt="Google" 
                    className="h-4 w-4 sm:h-5 sm:w-5"
                  />
                  Sign in with Google
                </Button>
              </div>
            </div>
          </div>
        </header>

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg flex items-center justify-center">
                <img 
                  src="/lovable-uploads/1a618b3c-11e7-43e4-a2d5-c1e6f36e48ba.png" 
                  alt="Think With Me Logo" 
                  className="h-8 w-8 sm:h-10 sm:w-10"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Think With Me</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Thinking Partners for Classrooms</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button 
                onClick={handleSignIn} 
                className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 rounded-full px-6 py-2 flex items-center gap-2 shadow-sm hover:shadow-md transition-shadow"
              >
                <img 
                  src="/lovable-uploads/b0174e22-c5cc-4bc5-8b34-8df738173560.png" 
                  alt="Google" 
                  className="h-4 w-4"
                />
                <span className="hidden sm:inline">Sign in with Google</span>
                <span className="sm:hidden">Sign in</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-5xl mx-auto">
          {/* Enhanced Tutor Header */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden mb-6">
            {/* Hero Section with Gradient Background */}
            <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 px-8 py-6">
              <div className="flex flex-col lg:flex-row items-start gap-6">
                <Avatar className="h-24 w-24 lg:h-28 lg:w-28 border-4 border-white/20 shadow-xl bg-white/10 backdrop-blur-sm">
                  <AvatarImage src={agent.avatar} alt={agent.name} />
                  <AvatarFallback className="bg-white/20 backdrop-blur-sm">
                    <Bot className="h-12 w-12 lg:h-14 lg:w-14 text-white" />
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 text-white">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div>
                      <h1 className="text-3xl lg:text-4xl font-bold mb-3 leading-tight">
                        {agent.name}
                      </h1>
                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                          {agent.type}
                        </Badge>
                        {agent.subject && (
                          <Badge variant="secondary" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                            {agent.subject}
                          </Badge>
                        )}
                        {agent.gradeLevel && (
                          <Badge variant="outline" className="border-white/30 text-white hover:bg-white/10">
                            {agent.gradeLevel}
                          </Badge>
                        )}
                      </div>
                      <p className="text-blue-50 text-lg leading-relaxed max-w-2xl">
                        {agent.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2 lg:flex-col lg:items-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLike}
                        className={`text-white hover:bg-white/10 ${isLiked ? "text-red-200" : ""}`}
                      >
                        <Heart className={`h-4 w-4 ${isLiked ? "fill-red-200" : ""}`} />
                      </Button>
                      <div className="text-white">
                        <ShareButton 
                          tutorId={agent.id} 
                          tutorName={agent.name}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="px-8 py-6 bg-gray-50 dark:bg-gray-750 border-t border-gray-100 dark:border-gray-600">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-300">
                  {agent.interactions && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span className="font-medium">{agent.interactions.toLocaleString()} interactions</span>
                    </div>
                  )}
                  {agent.performance && (
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{agent.performance.toFixed(1)} rating</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Created {new Date(agent.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    size="lg" 
                    onClick={handleDemo}
                    className="bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all"
                  >
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Try Demo Chat
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={handleSignIn}
                    className="border-blue-200 text-blue-700 hover:bg-blue-50 shadow-sm"
                  >
                    Sign In to Use
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats and Details */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Stats Card */}
            <Card className="shadow-md border-gray-100 dark:border-gray-700">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Users className="h-5 w-5 text-blue-600" />
                  Performance Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">Interactions</span>
                  <span className="font-bold text-lg text-gray-900 dark:text-white">{agent.interactions || 0}</span>
                </div>
                <Separator />
                {agent.performance && (
                  <>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600 dark:text-gray-300 font-medium">Rating</span>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-bold text-lg text-gray-900 dark:text-white">{agent.performance.toFixed(1)}</span>
                      </div>
                    </div>
                    <Separator />
                  </>
                )}
                {agent.studentsSaved && (
                  <>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600 dark:text-gray-300 font-medium">Students Helped</span>
                      <span className="font-bold text-lg text-gray-900 dark:text-white">{agent.studentsSaved}</span>
                    </div>
                    <Separator />
                  </>
                )}
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">Created</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {new Date(agent.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Details Card */}
            <Card className="shadow-md border-gray-100 dark:border-gray-700">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Bot className="h-5 w-5 text-blue-600" />
                  Tutor Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {agent.teachingStyle && (
                  <>
                    <div className="py-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Teaching Style</h4>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{agent.teachingStyle}</p>
                    </div>
                    <Separator />
                  </>
                )}
                {agent.learningObjective && (
                  <>
                    <div className="py-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Learning Objective</h4>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{agent.learningObjective}</p>
                    </div>
                    <Separator />
                  </>
                )}
                <div className="py-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Availability</h4>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                      <MessageCircle className="h-3 w-3 mr-1" />
                      Chat Available
                    </Badge>
                    {agent.status === 'active' ? (
                      <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Draft</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action */}
          <Card className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800 shadow-lg">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Ready to create your own AI tutor?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto text-lg leading-relaxed">
                Join thousands of educators who are already using AI to enhance their teaching. 
                Create personalized tutors for your students in minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  onClick={handleSignIn}
                  className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all"
                >
                  Get Started Free
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={handleBack}
                  className="px-8 py-3 text-lg border-blue-200 text-blue-700 hover:bg-blue-50"
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
