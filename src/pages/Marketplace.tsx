import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Bot, Users, Search, Filter, Star, TrendingUp, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAgents } from "@/hooks/useAgents";
const Marketplace = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("trending");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [gradeLevelFilter, setGradeLevelFilter] = useState("all");
  const {
    agents,
    isLoading
  } = useAgents('all-agents');
  const handleTutorClick = (tutorId: string) => {
    navigate(`/agents/${tutorId}`);
  };
  const handleDemoTutor = (tutorId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/tutors/${tutorId}/chat`);
  };

  // Filter and sort tutors
  const filteredTutors = agents.filter(tutor => {
    const matchesSearch = tutor.name.toLowerCase().includes(searchTerm.toLowerCase()) || tutor.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = subjectFilter === "all" || tutor.subject === subjectFilter || tutor.type.includes(subjectFilter);
    const matchesGrade = gradeLevelFilter === "all" || tutor.gradeLevel === gradeLevelFilter;
    return matchesSearch && matchesSubject && matchesGrade;
  }).sort((a, b) => {
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
  return <div className="space-y-6">
      

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input placeholder="Search by subject, grade level, or tutor name..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 border-gray-300 dark:border-gray-600" />
          </div>
          
          <div className="grid grid-cols-2 sm:flex gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="trending">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    <span>Most Used</span>
                  </div>
                </SelectItem>
                <SelectItem value="new">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Recently Added</span>
                  </div>
                </SelectItem>
                <SelectItem value="top">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    <span>Highest Rated</span>
                  </div>
                </SelectItem>
                <SelectItem value="name">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <span>Alphabetical</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map(subject => <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={gradeLevelFilter} onValueChange={setGradeLevelFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Grade Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                {gradeLevels.map(grade => <SelectItem key={grade} value={grade}>
                    {grade}
                  </SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Tutors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ?
      // Loading skeleton
      Array.from({
        length: 6
      }).map((_, i) => <Card key={i} className="animate-pulse border-gray-200 dark:border-gray-700">
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
            </Card>) : filteredTutors.map(tutor => <Card key={tutor.id} className="cursor-pointer hover:shadow-md transition-all duration-200 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600" onClick={() => handleTutorClick(tutor.id)}>
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
                    <div className="flex flex-wrap gap-1 mt-1">
                      {tutor.subject && <Badge variant="secondary" className="text-xs font-medium">
                          {tutor.subject.charAt(0).toUpperCase() + tutor.subject.slice(1)}
                        </Badge>}
                      {tutor.gradeLevel && <Badge variant="outline" className="text-xs">
                          Grades {tutor.gradeLevel}
                        </Badge>}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-2 leading-relaxed">
                  {tutor.description}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{tutor.interactions || 0} uses</span>
                  </div>
                  {tutor.performance && <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>{tutor.performance.toFixed(1)}</span>
                    </div>}
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button size="sm" variant="outline" className="flex-1 text-sm" onClick={e => {
              e.stopPropagation();
              handleTutorClick(tutor.id);
            }}>
                    View Details
                  </Button>
                  <Button size="sm" className="flex-1 text-sm bg-blue-600 hover:bg-blue-700" onClick={e => handleDemoTutor(tutor.id, e)}>
                    Try Demo
                  </Button>
                </div>
              </CardContent>
            </Card>)}
      </div>

      {filteredTutors.length === 0 && !isLoading && <div className="text-center py-16">
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tutors found</h3>
          <p className="text-base text-gray-600 dark:text-gray-400 mb-4">Try adjusting your search criteria or browse all available tutors</p>
          <Button variant="outline" onClick={() => {
        setSearchTerm("");
        setSubjectFilter("all");
        setGradeLevelFilter("all");
      }}>
            Clear Filters
          </Button>
        </div>}
    </div>;
};
export default Marketplace;