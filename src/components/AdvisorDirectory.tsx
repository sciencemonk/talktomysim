
import { useState, useEffect } from "react";
import { useAllAdvisors } from "@/hooks/useAllAdvisors";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { AgentType } from "@/types/agent";

interface AdvisorDirectoryProps {
  onSelectAdvisor: (advisorId: string, advisor?: AgentType) => void;
  onAuthRequired?: () => void;
}

const AdvisorDirectory = ({ onSelectAdvisor, onAuthRequired }: AdvisorDirectoryProps) => {
  const { user } = useAuth();
  const { agents, isLoading, error } = useAllAdvisors();
  const [searchTerm, setSearchTerm] = useState("");

  // Filter advisors based on search term
  const filteredAdvisors = agents.filter(advisor =>
    advisor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    advisor.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    advisor.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdvisorSelect = (advisor: AgentType) => {
    // Use custom URL if available, otherwise fall back to agent ID route
    const chatUrl = advisor.url ? `/${advisor.url}` : `/tutors/${advisor.id}/chat`;
    window.open(chatUrl, '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-0">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-0">
        <div className="text-center">
          <p className="text-muted-foreground">Failed to load advisors</p>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Search Section */}
      <div className="p-6 border-b border-border">
        <div className="relative max-w-6xl mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Advisors Grid */}
      <div className="flex-1 overflow-auto p-6">
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {filteredAdvisors.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">
                {searchTerm ? "No sims found matching your search." : "No sims available."}
              </p>
            </div>
          ) : (
            filteredAdvisors.map((advisor) => (
              <Card
                key={advisor.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleAdvisorSelect(advisor)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 flex-shrink-0">
                      <AvatarImage src={advisor.avatar} alt={advisor.name} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        <Bot className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg mb-1 truncate">
                        {advisor.name}
                      </h3>
                      
                      {advisor.title && (
                        <p className="text-sm text-muted-foreground">
                          {advisor.title}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvisorDirectory;
