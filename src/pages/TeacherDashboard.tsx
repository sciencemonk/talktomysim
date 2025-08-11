import React, { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Plus, BookOpen, Users, BarChart3, Settings, Search, Filter, MoreHorizontal, Bot, Trash2, Archive, Star, TrendingUp, Calendar, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useTutors } from "@/hooks/useTutors";
import { useToast } from "@/components/ui/use-toast";
import { AgentType } from "@/types/agent";

const TeacherDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const filter = searchParams.get('filter') || 'all-tutors';
  const { tutors, isLoading, error } = useTutors(filter);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const { toast } = useToast();

  const filteredTutors = tutors
    .filter(tutor => 
      tutor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tutor.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tutor.type.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "created":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "interactions":
          return (b.interactions || 0) - (a.interactions || 0);
        case "status":
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

  const activeTutors = tutors.filter(tutor => tutor.status === "active");
  const totalInteractions = tutors.reduce((sum, tutor) => sum + (tutor.interactions || 0), 0);
  const averageHelpfulness = tutors.length > 0 
    ? tutors.reduce((sum, tutor) => sum + (tutor.helpfulnessScore || 0), 0) / tutors.length 
    : 0;

  const handleDeleteTutor = (tutorId: string, tutorName: string) => {
    toast({
      title: "Tutor deleted",
      description: `${tutorName} has been successfully deleted.`,
      variant: "destructive"
    });
  };

  const handleArchiveTutor = (tutorId: string, tutorName: string) => {
    toast({
      title: "Tutor archived",
      description: `${tutorName} has been archived and can be restored later.`
    });
  };

  const handleDuplicateTutor = (tutorId: string, tutorName: string) => {
    toast({
      title: "Tutor duplicated",
      description: `A copy of ${tutorName} has been created.`
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6">
          <div className="text-center text-red-500">
            <AlertCircle className="h-12 w-12 mx-auto mb-4" />
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tutor Hub</h1>
            <p className="text-muted-foreground">
              Manage and monitor your AI tutors
            </p>
          </div>
          <Button asChild>
            <Link to="/tutors/create" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create New Tutor
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tutors</CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tutors.length}</div>
              <p className="text-xs text-muted-foreground">
                {activeTutors.length} active
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Interactions</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalInteractions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Across all tutors
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Helpfulness</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageHelpfulness.toFixed(1)}/10</div>
              <p className="text-xs text-muted-foreground">
                Student feedback
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Students Helped</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tutors.reduce((sum, tutor) => sum + (tutor.studentsSaved || 0), 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tutors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="created">Date Created</SelectItem>
                    <SelectItem value="interactions">Interactions</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Filter Tabs */}
        <Tabs value={filter} onValueChange={(value) => setSearchParams({ filter: value })}>
          <TabsList>
            <TabsTrigger value="all-tutors">All Tutors</TabsTrigger>
            <TabsTrigger value="my-tutors">My Tutors</TabsTrigger>
            <TabsTrigger value="team-tutors">Team Tutors</TabsTrigger>
          </TabsList>
          
          <TabsContent value={filter} className="space-y-4">
            {filteredTutors.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Bot className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No tutors found</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    {searchTerm ? "Try adjusting your search terms." : "Get started by creating your first AI tutor."}
                  </p>
                  {!searchTerm && (
                    <Button asChild>
                      <Link to="/tutors/create">Create New Tutor</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredTutors.map((tutor) => (
                  <Card key={tutor.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage 
                              src={`https://api.dicebear.com/7.x/bottts/svg?seed=${tutor.id}`} 
                              alt={tutor.name} 
                            />
                            <AvatarFallback>
                              <Bot className="h-5 w-5" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{tutor.name}</CardTitle>
                            <Badge 
                              variant={tutor.status === "active" ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {tutor.status}
                            </Badge>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleDuplicateTutor(tutor.id, tutor.name)}>
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleArchiveTutor(tutor.id, tutor.name)}>
                              <Archive className="h-4 w-4 mr-2" />
                              Archive
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteTutor(tutor.id, tutor.name)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="mb-4">
                        {tutor.description}
                      </CardDescription>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Type:</span>
                          <Badge variant="outline">{tutor.type}</Badge>
                        </div>
                        
                        {tutor.interactions !== undefined && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Interactions:</span>
                            <span className="font-medium">{tutor.interactions.toLocaleString()}</span>
                          </div>
                        )}
                        
                        {tutor.helpfulnessScore !== undefined && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Helpfulness:</span>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">{tutor.helpfulnessScore.toFixed(1)}/10</span>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Created:</span>
                          <span className="font-medium">{tutor.createdAt}</span>
                        </div>
                      </div>
                      
                      <Separator className="my-4" />
                      
                      <div className="flex gap-2">
                        <Button asChild className="flex-1">
                          <Link to={`/tutors/${tutor.id}`}>View Details</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TeacherDashboard;
