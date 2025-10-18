import { useParams, useNavigate } from "react-router-dom";
import { useAgentDetails } from "@/hooks/useAgentDetails";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, ChevronLeft, MessageCircle, Clock, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import AgentConfigSettings from "@/components/AgentConfigSettings";
import { RolePlayDialog } from "@/components/RolePlayDialog";
import { CallInterface } from "@/components/CallInterface";
import { deleteAgent } from "@/services/agentService";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";

const AgentDetails = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const {
    agent,
    isLoading,
    error,
    isRolePlayOpen,
    openRolePlay,
    closeRolePlay,
    showSuccessToast,
    isDirectCallActive,
    directCallInfo,
    startDirectCall,
    endDirectCall
  } = useAgentDetails(agentId);

  const handleBack = () => {
    navigate('/home');
  };

  const handleDelete = async () => {
    if (!agentId || !agent) return;
    
    setIsDeleting(true);
    try {
      await deleteAgent(agentId);
      toast({
        title: "Thinking partner deleted",
        description: `${agent.name} has been successfully removed.`
      });
      navigate('/home');
    } catch (error: any) {
      console.error("Error deleting thinking partner:", error);
      toast({
        title: "Failed to delete",
        description: error.message || "There was an error deleting your thinking partner.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8 space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-6 w-48" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Skeleton className="h-96" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
            </div>
          </div>
        </div>
      </div>;
  }

  if (error || !agent) {
    return <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <Button variant="ghost" onClick={handleBack} className="gap-2 text-muted-foreground hover:text-foreground mb-6">
            <ChevronLeft className="h-4 w-4" />
            Back to Home
          </Button>
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <Bot className="h-12 w-12 text-destructive" />
                <div>
                  <h3 className="font-semibold">Thinking Partner Not Found</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {error || "The thinking partner you're looking for doesn't exist or you don't have permission to view it."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>;
  }

  const handleAgentUpdate = (updatedAgent: any) => {
    console.log("Thinking partner updated:", updatedAgent);
  };

  return <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-6">
        {/* Back Button */}
        <Button variant="ghost" onClick={handleBack} className="gap-2 text-muted-foreground hover:text-foreground mb-6">
          <ChevronLeft className="h-4 w-4" />
          Back to Home
        </Button>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration - Takes up 2 columns */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">Thinking Partner Configuration</CardTitle>
                <CardDescription className="text-sm">
                  Customize your child's thinking partner behavior and teaching approach
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AgentConfigSettings agent={agent} onAgentUpdate={handleAgentUpdate} showSuccessToast={showSuccessToast} showTeachingInstructions={true} />
              </CardContent>
            </Card>
          </div>

          {/* Activity Overview - Takes up 1 column */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
                <CardDescription className="text-sm">
                  Manage your child's thinking partner
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={openRolePlay}
                  className="w-full gap-2"
                  variant="outline"
                >
                  <Bot className="h-4 w-4" />
                  Test Conversation
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
                <CardDescription className="text-sm">
                  Latest conversations with your child
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Learning session</p>
                    <p className="text-xs text-muted-foreground">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Question & answer</p>
                    <p className="text-xs text-muted-foreground">15 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Exploration chat</p>
                    <p className="text-xs text-muted-foreground">1 hour ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Usage Summary */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">Usage Summary</CardTitle>
                <CardDescription className="text-sm">
                  Overview of conversations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Conversations</span>
                  <div className="text-sm font-semibold">{agent.interactions || 0}</div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">This Week</span>
                  <div className="text-sm font-semibold">12</div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Average Duration</span>
                  <div className="text-sm font-semibold">8 min</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Delete Section */}
        <div className="mt-8 pt-8 border-t border-border">
          <Card className="border-destructive/20">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-destructive">Danger Zone</CardTitle>
              <CardDescription className="text-sm">
                Permanently delete this thinking partner. This action cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    className="gap-2"
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4" />
                    {isDeleting ? 'Deleting...' : 'Delete Thinking Partner'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete <strong>{agent?.name}</strong> and all associated conversations. 
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDelete}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      Delete Permanently
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Role Play Dialog */}
      <RolePlayDialog open={isRolePlayOpen} onOpenChange={open => open ? openRolePlay() : closeRolePlay()} />

      {/* Direct Call Interface */}
      {isDirectCallActive && directCallInfo && <CallInterface open={isDirectCallActive} onOpenChange={open => !open && endDirectCall()} persona={null} directCallInfo={directCallInfo} />}
    </div>;
};

export default AgentDetails;
