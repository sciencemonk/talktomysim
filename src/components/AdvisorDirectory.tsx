import React, { useState, useEffect } from "react";
import { useAllAdvisors } from "@/hooks/useAllAdvisors";
import { AgentType } from "@/types/agent";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, MessageCircle, Users, Star, ChevronRight } from "lucide-react";
import { LoaderIcon } from "@/components/LoaderIcon";

interface AdvisorDirectoryProps {
  onSelectAdvisor: (advisorId: string, advisor?: AgentType) => void;
  onAuthRequired?: () => void;
}

const AdvisorDirectory: React.FC<AdvisorDirectoryProps> = ({
  onSelectAdvisor,
  onAuthRequired
}) => {
  const { data: advisors = [], isLoading, error } = useAllAdvisors();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Filter advisors based on search term and category
  const filteredAdvisors = advisors.filter(advisor => {
    const matchesSearch = advisor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         advisor.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         advisor.categories?.some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = !selectedCategory || advisor.categories?.includes(selectedCategory);
    
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const allCategories = Array.from(
    new Set(advisors.flatMap(advisor => advisor.categories || []))
  ).sort();

  const handleAdvisorSelect = (advisor: AgentType) => {
    onSelectAdvisor(advisor.id, advisor);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <LoaderIcon size={24} />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Error: {error.message}</div>;
  }

  return (
    <div className="container mx-auto p-6">
      {/* Search Input */}
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search advisors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Category Filters */}
      <div className="mb-4 flex overflow-x-auto pb-2">
        <Button
          variant="outline"
          className={`mr-2 rounded-full ${!selectedCategory ? "bg-primary text-primary-foreground hover:bg-primary/80" : "hover:bg-secondary/50"}`}
          onClick={() => setSelectedCategory(null)}
        >
          All
        </Button>
        {allCategories.map((category) => (
          <Button
            key={category}
            variant="outline"
            className={`mr-2 rounded-full ${selectedCategory === category ? "bg-primary text-primary-foreground hover:bg-primary/80" : "hover:bg-secondary/50"}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Advisor List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAdvisors.map((advisor) => (
          <Card key={advisor.id} className="bg-card text-card-foreground shadow-sm">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={advisor.image_url} alt={advisor.name} />
                  <AvatarFallback>{advisor.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg font-semibold">{advisor.name}</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    {advisor.categories?.map((category, index) => (
                      <Badge key={index} variant="secondary" className="mr-1">
                        {category}
                      </Badge>
                    ))}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{advisor.description}</p>
              <Button variant="link" className="mt-4 w-full justify-end" onClick={() => handleAdvisorSelect(advisor)}>
                Chat <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
        {filteredAdvisors.length === 0 && (
          <div className="text-center text-fgMuted col-span-full">No advisors found.</div>
        )}
      </div>
    </div>
  );
};

export default AdvisorDirectory;
