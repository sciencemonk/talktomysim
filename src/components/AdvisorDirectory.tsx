
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
    advisor.expertise?.some(exp => exp.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAdvisorSelect = (advisor: AgentType) => {
    if (!user && onAuthRequired) {
      onAuthRequired();
    } else {
      onSelectAdvisor(advisor.id, advisor);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
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
      <div className="p-4 border-b border-border">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sims..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Advisors Grid */}
      <div className="flex-1 overflow-auto p-4">
        <div className="grid gap-4 max-w-4xl mx-auto">
          {filteredAdvisors.length === 0 ? (
            <div className="text-center py-12">
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
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
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
                      
                      {advisor.role && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {advisor.role}
                        </p>
                      )}
                      
                      {advisor.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {advisor.description}
                        </p>
                      )}
                      
                      {advisor.expertise && advisor.expertise.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {advisor.expertise.slice(0, 3).map((skill, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary"
                            >
                              {skill}
                            </span>
                          ))}
                          {advisor.expertise.length > 3 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-muted text-muted-foreground">
                              +{advisor.expertise.length - 3} more
                            </span>
                          )}
                        </div>
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
