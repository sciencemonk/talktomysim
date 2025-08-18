
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Bot, Users, BookOpen, BarChart, Search, Filter, Star, TrendingUp, Clock, User } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">Agent Hub</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleSignIn}>
              Sign In with Google
            </Button>
            <Button onClick={handleSignIn} className="bg-blue-600 hover:bg-blue-700">
              Create Tutor
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Discover AI Tutors
            <span className="block text-blue-600">Created by Teachers</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Browse our marketplace of AI tutoring agents created by educators worldwide. 
            Find the perfect tutor for your students or create your own.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tutors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
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
                      Trending
                    </div>
                  </SelectItem>
                  <SelectItem value="new">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Newest
                    </div>
                  </SelectItem>
                  <SelectItem value="top">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      Top Rated
                    </div>
                  </SelectItem>
                  <SelectItem value="name">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      A-Z
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 bg-gray-200 rounded-full" />
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-24" />
                      <div className="h-3 bg-gray-200 rounded w-16" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded" />
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            filteredTutors.map((tutor) => (
              <Card 
                key={tutor.id} 
                className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
                onClick={() => handleTutorClick(tutor.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={tutor.avatar} alt={tutor.name} />
                      <AvatarFallback>
                        <Bot className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm font-semibold truncate">
                        {tutor.name}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {tutor.type}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                    {tutor.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {tutor.subject && (
                      <Badge variant="secondary" className="text-xs">
                        {tutor.subject}
                      </Badge>
                    )}
                    {tutor.gradeLevel && (
                      <Badge variant="outline" className="text-xs">
                        {tutor.gradeLevel}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {tutor.interactions || 0}
                    </div>
                    {tutor.performance && (
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {tutor.performance.toFixed(1)}
                      </div>
                    )}
                  </div>

                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={(e) => handleDemoTutor(tutor.id, e)}
                  >
                    Try Demo
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {filteredTutors.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Bot className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No tutors found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-12 mt-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Why Choose Agent Hub?
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg text-center">
            <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Teacher-Created
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              All tutors are created by real educators who understand student needs and learning challenges.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg text-center">
            <BookOpen className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Subject Expertise
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Find specialized tutors for any subject, from elementary math to advanced sciences.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg text-center">
            <BarChart className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Proven Results
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Track performance and see real improvements in student learning outcomes.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
