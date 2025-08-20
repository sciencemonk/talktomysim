import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUserAdvisors } from "@/hooks/useUserAdvisors";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, MessageSquare, Plus } from "lucide-react";
import AdvisorSearchModal from "@/components/AdvisorSearchModal";
import UserAdvisorChat from "@/components/UserAdvisorChat";
import { UserAdvisor } from "@/services/userAdvisorService";
import { Advisor } from "@/types/advisor";

const Landing = () => {
  const { user } = useAuth();
  const { userAdvisors, addAdvisor, isLoading } = useUserAdvisors();
  const [showAdvisorSearch, setShowAdvisorSearch] = useState(false);
  const [selectedAdvisor, setSelectedAdvisor] = useState<UserAdvisor | null>(null);

  const handleAdvisorSelect = async (advisor: Advisor) => {
    setShowAdvisorSearch(false);
    
    // Add advisor to user's collection
    const userAdvisor = await addAdvisor(advisor);
    if (userAdvisor) {
      // Start chat with the advisor
      setSelectedAdvisor(userAdvisor);
    }
  };

  const handleAdvisorClick = (advisor: UserAdvisor) => {
    setSelectedAdvisor(advisor);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto py-24 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl lg:text-6xl">
              Welcome to AI Camp
            </h1>
            <p className="mt-6 text-xl text-gray-500 max-w-3xl mx-auto">
              Unlock your child's full potential with personalized AI tutors.
            </p>
            <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg">Get Started</Button>
              <Button variant="outline" size="lg">Learn More</Button>
            </div>
          </div>

          <div className="mt-20">
            <h2 className="text-3xl font-semibold text-gray-900 text-center mb-8">
              Key Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Personalized Learning</CardTitle>
                </CardHeader>
                <CardContent>
                  AI tutors adapt to your child's learning style and pace.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Interactive Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  Engaging lessons that make learning fun and effective.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Progress Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  Monitor your child's progress and identify areas for improvement.
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-80 border-r bg-muted/30 flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Your Advisors</h2>
              <Button
                onClick={() => setShowAdvisorSearch(true)}
                size="sm"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4 space-y-2">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-pulse">Loading advisors...</div>
                </div>
              ) : userAdvisors.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-muted-foreground mb-4">
                    No advisors yet
                  </div>
                  <Button
                    onClick={() => setShowAdvisorSearch(true)}
                    variant="outline"
                    size="sm"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Find Advisors
                  </Button>
                </div>
              ) : (
                userAdvisors.map((advisor) => (
                  <Card
                    key={advisor.id}
                    className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                      selectedAdvisor?.id === advisor.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => handleAdvisorClick(advisor)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={advisor.avatar_url} alt={advisor.name} />
                          <AvatarFallback>
                            {advisor.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm truncate">{advisor.name}</h3>
                          {advisor.title && (
                            <p className="text-xs text-muted-foreground truncate">
                              {advisor.title}
                            </p>
                          )}
                          {advisor.category && (
                            <Badge variant="secondary" className="text-xs mt-1">
                              {advisor.category}
                            </Badge>
                          )}
                        </div>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {selectedAdvisor ? (
            <UserAdvisorChat advisor={selectedAdvisor} />
          ) : (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center max-w-md">
                <div className="mb-6">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Welcome to AI Advisors</h3>
                  <p className="text-muted-foreground mb-6">
                    Select an advisor from the sidebar to start chatting, or find new advisors to add to your collection.
                  </p>
                </div>
                <Button
                  onClick={() => setShowAdvisorSearch(true)}
                  className="w-full"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Find Advisors
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Advisor Search Modal */}
      <AdvisorSearchModal
        isOpen={showAdvisorSearch}
        onClose={() => setShowAdvisorSearch(false)}
        onAdvisorSelect={handleAdvisorSelect}
      />
    </div>
  );
};

export default Landing;
