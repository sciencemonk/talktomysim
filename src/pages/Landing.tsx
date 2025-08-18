
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Bot, Users, BookOpen, BarChart, Search, Filter, Star, TrendingUp, Clock, User, CheckCircle, Shield, Award } from "lucide-react";
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

  const handleSignIn = () => {
    navigate("/dashboard");
  };

  const handleTutorClick = (tutorId: string) => {
    navigate(`/tutors/${tutorId}`);
  };

  const handleDemoTutor = (tutorId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/tutors/${tutorId}/chat`);
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
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">TeacherHub</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">AI Tutoring Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleSignIn}>
                Sign In
              </Button>
              <Button onClick={handleSignIn} className="bg-blue-600 hover:bg-blue-700">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Trust Banner */}
      <section className="bg-blue-50 dark:bg-blue-950/30 border-b border-blue-100 dark:border-blue-900">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-center gap-8 text-sm text-blue-700 dark:text-blue-300">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>COPPA Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>Educator Verified</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              <span>Trusted by 10,000+ Teachers</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-6 py-8">
        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="mb-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Find AI Tutors</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Browse vetted AI tutoring agents created by certified educators</p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by subject, grade level, or tutor name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300 dark:border-gray-600"
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trending">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Most Used
                    </div>
                  </SelectItem>
                  <SelectItem value="new">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Recently Added
                    </div>
                  </SelectItem>
                  <SelectItem value="top">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      Highest Rated
                    </div>
                  </SelectItem>
                  <SelectItem value="name">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      Alphabetical
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger className="w-[140px]">
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

              <Select value={gradeLevelFilter} onValueChange={setGradeLevelFilter}>
                <SelectTrigger className="w-[140px]">
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

        {/* Tutors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse border-gray-200 dark:border-gray-700">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/5" />
                    <div className="flex gap-2">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            filteredTutors.map((tutor) => (
              <Card 
                key={tutor.id} 
                className="cursor-pointer hover:shadow-md transition-all duration-200 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600"
                onClick={() => handleTutorClick(tutor.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12 border-2 border-gray-100 dark:border-gray-700">
                      <AvatarImage src={tutor.avatar} alt={tutor.name} />
                      <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
                        <Bot className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base font-semibold truncate text-gray-900 dark:text-white">
                        {tutor.name}
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                        {tutor.type}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-2 leading-relaxed">
                    {tutor.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {tutor.subject && (
                      <Badge variant="secondary" className="text-xs font-medium">
                        {tutor.subject}
                      </Badge>
                    )}
                    {tutor.gradeLevel && (
                      <Badge variant="outline" className="text-xs">
                        {tutor.gradeLevel}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{tutor.interactions || 0} uses</span>
                    </div>
                    {tutor.performance && (
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{tutor.performance.toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="flex-1 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTutorClick(tutor.id);
                      }}
                    >
                      View Details
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1 text-xs bg-blue-600 hover:bg-blue-700"
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
          <div className="text-center py-16">
            <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tutors found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Try adjusting your search criteria or browse all available tutors</p>
            <Button 
              variant="outline" 
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
      <section className="bg-gray-50 dark:bg-gray-800/50 py-16 mt-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Trusted by Educators Worldwide
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Our platform is designed by teachers, for teachers. Every AI tutor is created and verified by certified educators.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-900 p-8 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg w-fit mx-auto mb-4">
                <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Educator Created
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                Every AI tutor is built by certified teachers who understand pedagogy and student learning needs.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 p-8 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg w-fit mx-auto mb-4">
                <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Safe & Secure
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                COPPA compliant platform with privacy-first design and content moderation for classroom use.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 p-8 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg w-fit mx-auto mb-4">
                <BarChart className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Measurable Impact
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                Track student progress and engagement with detailed analytics and performance insights.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">TeacherHub</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Empowering educators with AI</p>
              </div>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              © 2024 TeacherHub. Built for educators, by educators.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
