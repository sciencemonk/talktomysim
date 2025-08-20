
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAdvisors } from "@/hooks/useAdvisors";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search, Plus, Edit, MessageSquare, Settings, Trash2 } from "lucide-react";
import AdvisorSearchModal from "@/components/AdvisorSearchModal";
import { Advisor } from "@/types/advisor";

const AdvisorsDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { advisors, isLoading, error, refetch } = useAdvisors();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAdvisorSearch, setShowAdvisorSearch] = useState(false);
  const [selectedAdvisor, setSelectedAdvisor] = useState<Advisor | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedAdvisor, setEditedAdvisor] = useState<Advisor | null>(null);

  const filteredAdvisors = advisors.filter(advisor =>
    advisor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    advisor.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    advisor.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditClick = (advisor: Advisor) => {
    setIsEditing(true);
    setEditedAdvisor({ ...advisor });
  };

  const handleSaveClick = async () => {
    if (!editedAdvisor) return;

    try {
      // await advisorService.updateAdvisor(editedAdvisor.id, editedAdvisor);
      setIsEditing(false);
      setEditedAdvisor(null);
      refetch(); // Refresh the advisor list
    } catch (error) {
      console.error("Error updating advisor:", error);
      // Handle error (e.g., display an error message)
    }
  };

  const handleDeleteClick = async (advisorId: string) => {
    try {
      // await advisorService.deleteAdvisor(advisorId);
      refetch(); // Refresh the advisor list
    } catch (error) {
      console.error("Error deleting advisor:", error);
      // Handle error (e.g., display an error message)
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (editedAdvisor) {
      setEditedAdvisor({ ...editedAdvisor, [name]: value });
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">AI Advisors</h1>
        <Button onClick={() => setShowAdvisorSearch(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Advisor
        </Button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search advisors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-pulse">Loading advisors...</div>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">Error: {error}</div>
      ) : (
        <ScrollArea className="h-[calc(100vh-250px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAdvisors.map((advisor) => (
              <Card key={advisor.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{advisor.name}</CardTitle>
                  <div className="space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditClick(advisor)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(advisor.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    {advisor.description}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}

      <AdvisorSearchModal
        isOpen={showAdvisorSearch}
        onClose={() => setShowAdvisorSearch(false)}
        onAdvisorSelect={(advisor) => {
          setSelectedAdvisor(advisor);
          setShowAdvisorSearch(false);
        }}
      />
    </div>
  );
};

export default AdvisorsDashboard;
