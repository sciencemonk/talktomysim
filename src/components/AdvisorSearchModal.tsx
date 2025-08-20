
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, MessageSquare } from "lucide-react";
import { useAdvisors } from "@/hooks/useAdvisors";
import { Advisor } from "@/types/advisor";

interface AdvisorSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdvisorSelect: (advisor: Advisor) => void;
}

const AdvisorSearchModal = ({ isOpen, onClose, onAdvisorSelect }: AdvisorSearchModalProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { advisors, isLoading } = useAdvisors();

  const filteredAdvisors = advisors.filter(advisor =>
    advisor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    advisor.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    advisor.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdvisorClick = (advisor: Advisor) => {
    onAdvisorSelect(advisor);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Find AI Advisors</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search advisors by name, description, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <ScrollArea className="h-[60vh]">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-pulse">Loading advisors...</div>
              </div>
            ) : filteredAdvisors.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No advisors found matching your search.</p>
              </div>
            ) : (
              <div className="grid gap-4 p-1">
                {filteredAdvisors.map((advisor) => (
                  <Card key={advisor.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={advisor.avatar_url} alt={advisor.name} />
                          <AvatarFallback>
                            {advisor.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <CardTitle className="text-lg">{advisor.name}</CardTitle>
                              {advisor.title && (
                                <CardDescription className="mt-1">
                                  {advisor.title}
                                </CardDescription>
                              )}
                            </div>
                            <Button
                              onClick={() => handleAdvisorClick(advisor)}
                              size="sm"
                            >
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Talk
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      {advisor.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {advisor.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        {advisor.category && (
                          <Badge variant="secondary">
                            {advisor.category}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdvisorSearchModal;
