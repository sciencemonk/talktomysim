
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, MessageCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AgentType } from "@/types/agent";
import { useAllAdvisors } from "@/hooks/useAllAdvisors";

interface AdvisorDirectoryProps {
  onSelectAdvisor: (advisorId: string, advisor?: AgentType) => void;
}

const AdvisorDirectory = ({ onSelectAdvisor }: AdvisorDirectoryProps) => {
  const { agents: advisors, isLoading, error } = useAllAdvisors();

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col h-screen">
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                    <Skeleton className="h-10 w-10 rounded-full mr-3" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-32 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4 mb-4" />
                    <Skeleton className="h-9 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Unable to load advisors</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Choose an Advisor</h1>
            <p className="text-muted-foreground">
              Select an advisor to start a new conversation
            </p>
          </div>

          {advisors && advisors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {advisors.map((advisor) => (
                <Card key={advisor.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarImage src={advisor.avatar} alt={advisor.name} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        <Bot className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate">{advisor.name}</CardTitle>
                      <CardDescription className="truncate">
                        {advisor.title || advisor.subject}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {advisor.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {advisor.description}
                      </p>
                    )}

                    <Button 
                      onClick={() => onSelectAdvisor(advisor.id, advisor)}
                      className="w-full"
                      size="sm"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Start Chat
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Bot className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No advisors available</h2>
              <p className="text-muted-foreground">
                Check back later for new advisors to chat with.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvisorDirectory;
