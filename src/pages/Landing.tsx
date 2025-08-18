import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Bot, Users, Search, Filter, Star, TrendingUp, Clock, User, CheckCircle, Shield, Award, Lightbulb, Zap, Sparkles, Target } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAgents } from "@/hooks/useAgents";
import { AgentType } from "@/types/agent";

const Landing = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("trending");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [gradeLevelFilter, setGradeLevelFilter] = useState("all");
  
  const { agents, isLoading } = useAgents('all-agents');

  const handleSignInWithGoogle = () => {
    navigate("/dashboard");
  };

  const handleTutorClick = (tutorId: string) => {
    navigate(`/tutors/${tutorId}`);
  };

  const handleDemoTutor = (tutorId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/tutors/${tutorId}/chat`);
  };

  // Helper function to truncate learning objective
  const truncateLearningObjective = (text: string | undefined, maxSentences: number = 2) => {
    if (!text) return "";
    
    // Split by sentence endings
    const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
    
    if (sentences.length <= maxSentences) {
      return text;
    }
    
    return sentences.slice(0, maxSentences).join(". ") + "...";
  };

  // Filter and sort tutors
  const filteredTutors = agents
    .filter(tutor => {
      const matchesSearch = tutor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tutor.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSubject = subjectFilter === "all" || tutor.subject === subjectFilter || tutor.type.includes(subjectFilter);
      const matchesGrade = gradeLevelFilter === "all" || tutor.gradeLevel === gradeLevelFilter;
      return matchesSearch && matchesSubject && matchesGrade;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "trending":
          return (b.interactions || 0) - (a.interactions || 0);
        case "new":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "top":
          return (b.performance || 0) - (a.performance || 0);
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  const subjects = Array.from(new Set(agents.map(t => t.subject).filter(Boolean)));
  const gradeLevels = Array.from(new Set(agents.map(t => t.gradeLevel).filter(Boolean)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-blue-950">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <img 
                  src="/lovable-uploads/1a618b3c-11e7-43e4-a2d5-c1e6f36e48ba.png" 
                  alt="Think With Me Logo" 
                  className="h-8 w-8 sm:h-10 sm:w-10"
                />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Think With Me
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-medium">
                  Thinking Partners for Classrooms
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                onClick={handleSignInWithGoogle} 
                className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 rounded-full text-sm sm:text-base px-6 sm:px-8 py-2.5 sm:py-3 font-semibold flex items-center gap-3 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <img 
                  src="/lovable-uploads/b0174e22-c5cc-4bc5-8b34-8df738173560.png" 
                  alt="Google" 
                  className="h-5 w-5 sm:h-6 sm:w-6"
                />
                Sign in with Google
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <section className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Trust Banner */}
        <section className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-2xl mb-6 sm:mb-8">
          <div className="px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-blue-700 dark:text-blue-300">
              <div className="flex items-center gap-2">
                <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>COPPA Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Built for Classrooms</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Free Google Sign In</span>
              </div>
            </div>
          </div>
        </section>

        {/* Search and Filters */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 sm:p-8 mb-6 sm:mb-8 shadow-xl">
          <div className="flex flex-col gap-6">
            <div className="relative">
              <Search className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search by subject, grade level, or tutor name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 text-base border-gray-300 dark:border-gray-600 rounded-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="grid grid-cols-2 sm:flex gap-3 sm:gap-4">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[160px] h-11 rounded-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur border-gray-300 dark:border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trending">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      <span className="hidden sm:inline">Most Used</span>
                      <span className="sm:hidden">Popular</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="new">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span className="hidden sm:inline">Recently Added</span>
                      <span className="sm:hidden">New</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="top">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      <span className="hidden sm:inline">Highest Rated</span>
                      <span className="sm:hidden">Top</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="name">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <span className="hidden sm:inline">Alphabetical</span>
                      <span className="sm:hidden">A-Z</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger className="w-full sm:w-[160px] h-11 rounded-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur border-gray-300 dark:border-gray-600">
                  <SelectValue placeholder="Subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map(subject => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="col-span-2 sm:col-span-1">
                <Select value={gradeLevelFilter} onValueChange={setGradeLevelFilter}>
                  <SelectTrigger className="w-full sm:w-[160px] h-11 rounded-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur border-gray-300 dark:border-gray-600">
                    <SelectValue placeholder="Grade Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Grades</SelectItem>
                    {gradeLevels.map(grade => (
                      <SelectItem key={grade} value={grade}>
                        {grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Tutors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                        <div className="flex gap-2">
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-16" />
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-20" />
                        </div>
                      </div>
                    </div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/5" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="flex justify-between items-center">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12" />
                    </div>
                    <div className="flex gap-3">
                      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex-1" />
                      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex-1" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            filteredTutors.map((tutor) => (
              <Card 
                key={tutor.id} 
                className="cursor-pointer hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800 hover:-translate-y-1 group shadow-sm"
                onClick={() => handleTutorClick(tutor.id)}
              >
                <CardContent className="p-4">
                  {/* Header with Avatar and Title */}
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar className="h-10 w-10 border border-gray-200 dark:border-gray-700 rounded-lg group-hover:scale-105 transition-transform duration-200">
                      <AvatarImage src={tutor.avatar} alt={tutor.name} className="rounded-lg" />
                      <AvatarFallback className="bg-blue-500 text-white rounded-lg">
                        <Bot className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                        {tutor.name}
                      </h3>
                      
                      {/* Badges */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {tutor.subject && (
                          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 text-xs font-medium rounded-full px-2 py-0.5 border-0">
                            {tutor.subject}
                          </Badge>
                        )}
                        {tutor.gradeLevel && (
                          <Badge variant="outline" className="text-xs font-medium rounded-full px-2 py-0.5 border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-300">
                            {tutor.gradeLevel}
                          </Badge>
                        )}
                        {tutor.performance && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>{tutor.performance.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-2 leading-relaxed text-sm">
                    {tutor.description}
                  </p>

                  {/* Learning Objective */}
                  {tutor.learningObjective && (
                    <div className="mb-3 p-2 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-start gap-2">
                        <Target className="h-3 w-3 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-green-700 dark:text-green-300 leading-relaxed">
                          {truncateLearningObjective(tutor.learningObjective)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
                    <div className="flex items-center gap-2">
                      <Users className="h-3 w-3" />
                      <span>{tutor.interactions || 0} interactions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3" />
                      <span>Teacher Name</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="flex-1 text-xs font-medium rounded-full border hover:bg-gray-50 dark:hover:bg-gray-800 h-8 transition-all duration-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTutorClick(tutor.id);
                      }}
                    >
                      View Details
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1 text-xs font-medium bg-blue-600 hover:bg-blue-700 rounded-full shadow-sm hover:shadow-md transition-all duration-200 h-8"
                      onClick={(e) => handleDemoTutor(tutor.id, e)}
                    >
                      Try Demo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {filteredTutors.length === 0 && !isLoading && (
          <div className="text-center py-16 sm:py-20">
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 p-6 sm:p-8 rounded-full w-20 h-20 sm:w-28 sm:h-28 mx-auto mb-6 sm:mb-8 flex items-center justify-center shadow-lg">
              <Search className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">No tutors found</h3>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-6 px-4 max-w-md mx-auto">Try adjusting your search criteria or browse all available tutors</p>
            <Button 
              variant="outline" 
              size="lg"
              className="rounded-full px-8 py-3 font-semibold"
              onClick={() => {
                setSearchTerm("");
                setSubjectFilter("all");
                setGradeLevelFilter("all");
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="bg-gradient-to-br from-gray-50 via-blue-50/50 to-purple-50/50 dark:from-gray-800/50 dark:via-blue-950/30 dark:to-purple-950/30 py-16 sm:py-24 mt-16 sm:mt-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
              Three Pillars of Transformation
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Discover how Thinking Partners revolutionize the classroom experience through meaningful AI interactions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-10 max-w-5xl mx-auto">
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg p-8 sm:p-10 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 text-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group">
              <div className="bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 p-4 rounded-2xl w-fit mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                <Lightbulb className="h-8 w-8 sm:h-10 sm:w-10 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">
                Thinking Partners
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                AI tutors designed to engage students in deep, meaningful conversations that promote critical thinking and understanding.
              </p>
            </div>

            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg p-8 sm:p-10 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 text-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group">
              <div className="bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 p-4 rounded-2xl w-fit mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                <Zap className="h-8 w-8 sm:h-10 sm:w-10 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">
                True Differentiation
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                Every student gets personalized support that adapts to their learning style, pace, and needs in real-time.
              </p>
            </div>

            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg p-8 sm:p-10 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 text-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group">
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 p-4 rounded-2xl w-fit mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">
                Transformative Learning
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                Move beyond traditional instruction to create dynamic, interactive learning experiences that inspire and engage.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-gray-200/50 dark:border-gray-700/50 py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <img 
                  src="/lovable-uploads/1a618b3c-11e7-43e4-a2d5-c1e6f36e48ba.png" 
                  alt="Think With Me Logo" 
                  className="h-6 w-6 sm:h-8 sm:w-8"
                />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Think With Me</h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Empowering educators with AI</p>
              </div>
            </div>
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center">
              © 2024 Think With Me. Built for educators, by educators.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
